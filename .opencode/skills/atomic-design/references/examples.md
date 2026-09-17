# Exemplos concretos por camada (React + TSX + Tailwind + shadcn/ui)

Estes exemplos assumem um projeto com:
- React + TypeScript
- Tailwind CSS
- shadcn/ui instalado em `@/components/ui/`
- Aliases configurados (`@/components/...`)

Adapte os imports ao padrão do projeto.

---

## Átomo — `Button` (wrapper sobre shadcn)

Este é o padrão correto: o átomo do projeto **envolve** o primitivo do shadcn, aplicando apenas as variantes do design system.

```tsx
// src/components/atoms/Button/Button.tsx
import { ComponentProps } from 'react';
import { Button as ShadButton } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShadButtonProps = ComponentProps<typeof ShadButton>;

interface ButtonProps extends Omit<ShadButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Mapeia as variantes do DS do projeto para as variantes do shadcn
const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'destructive',
} as const;

const sizeMap = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <ShadButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled || isLoading}
      className={cn('gap-2', className)}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </ShadButton>
  );
}
```

```ts
// src/components/atoms/Button/index.ts
export { Button } from './Button';
```

**Por que é átomo**: é um primitivo de UI, não sabe nada sobre o domínio da aplicação, e toda configuração passa por props. O fato de envolver o `Button` do shadcn não o desclassifica — ele continua sendo o menor bloco funcional do *seu* design system.

---

## Átomo — `Input`

```tsx
// src/components/atoms/Input/Input.tsx
import { ComponentProps, forwardRef } from 'react';
import { Input as ShadInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InputProps extends ComponentProps<typeof ShadInput> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className, ...rest }, ref) => (
    <ShadInput
      ref={ref}
      className={cn(
        hasError && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  )
);

Input.displayName = 'Input';
```

---

## Molécula — `FormField`

Combina `Label` + `Input` + mensagem de erro. Propósito único: "um campo de formulário".

```tsx
// src/components/molecules/FormField/FormField.tsx
import { ComponentProps, useId } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/atoms/Input';

interface FormFieldProps extends ComponentProps<typeof Input> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, id, ...inputProps }: FormFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        hasError={!!error}
        aria-describedby={hint || error ? descriptionId : undefined}
        {...inputProps}
      />
      {hint && !error && (
        <span id={descriptionId} className="text-xs text-muted-foreground">
          {hint}
        </span>
      )}
      {error && (
        <span id={descriptionId} className="text-xs text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

Note que `Label` veio de `@/components/ui/label` (shadcn direto) porque é um primitivo sem customização necessária. `Input` veio do átomo do projeto porque ali queremos a lógica de erro customizada.

---

## Molécula — `SearchBox`

```tsx
// src/components/molecules/SearchBox/SearchBox.tsx
import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBox({ placeholder, onSearch, initialValue = '' }: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  );
}
```

O estado local aqui é sobre UI (o valor digitado) — a molécula não sabe o que fazer com a busca, só chama `onSearch`. Isso é o que a mantém reutilizável.

---

## Molécula — `Toast`

Apenas o **visual**. O gerenciamento de fila/auto-dismiss fica no `ToastProvider` (que mora em `providers/`, não em `components/`).

```tsx
// src/components/molecules/Toast/Toast.tsx
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  Toast as ShadToast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning';

interface ToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  onOpenChange?: (open: boolean) => void;
}

const variantConfig = {
  success: { icon: CheckCircle2,  className: 'border-green-500 bg-green-50 text-green-900' },
  error:   { icon: XCircle,       className: 'border-red-500 bg-red-50 text-red-900' },
  warning: { icon: AlertTriangle, className: 'border-yellow-500 bg-yellow-50 text-yellow-900' },
} as const;

export function Toast({ variant, title, description, onOpenChange }: ToastProps) {
  const { icon: Icon, className } = variantConfig[variant];

  return (
    <ShadToast className={cn('flex gap-3', className)} onOpenChange={onOpenChange}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1">
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      <ToastClose />
    </ShadToast>
  );
}
```

---

## Organismo — `Header`

```tsx
// src/components/organisms/Header/Header.tsx
import { Logo } from '@/components/atoms/Logo';
import { SearchBox } from '@/components/molecules/SearchBox';
import { NavMenu } from '@/components/molecules/NavMenu';

interface HeaderProps {
  navItems: Array<{ label: string; href: string }>;
  onSearch: (query: string) => void;
  userName?: string;
}

export function Header({ navItems, onSearch, userName }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b bg-background px-6 py-4">
      <div className="flex items-center gap-8">
        <Logo />
        <NavMenu items={navItems} />
      </div>
      <div className="flex items-center gap-4">
        <div className="w-80">
          <SearchBox placeholder="O que você procura?" onSearch={onSearch} />
        </div>
        {userName && (
          <span className="text-sm text-muted-foreground">Olá, {userName}</span>
        )}
      </div>
    </header>
  );
}
```

**Por que é organismo**: combina várias moléculas/átomos, representa uma seção completa da interface, e faria sentido no Storybook isoladamente. Recebe dados via props — não busca nem decide o que fazer com a busca.

---

## Template — `DashboardTemplate`

```tsx
// src/components/templates/DashboardTemplate/DashboardTemplate.tsx
import { ReactNode } from 'react';

interface DashboardTemplateProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function DashboardTemplate({ header, sidebar, children, footer }: DashboardTemplateProps) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] grid-rows-[auto_1fr_auto]">
      <div className="col-span-2">{header}</div>
      <aside className="border-r bg-muted/30">{sidebar}</aside>
      <main className="overflow-auto p-6">{children}</main>
      {footer && <div className="col-span-2 border-t">{footer}</div>}
    </div>
  );
}
```

**Por que é template**: zero lógica, zero fetch, só layout. Recebe tudo via slots (`ReactNode`). Várias páginas diferentes podem usá-lo.

---

## Página — `DashboardPage`

```tsx
// src/components/pages/DashboardPage/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate';
import { Header } from '@/components/organisms/Header';
import { Sidebar } from '@/components/organisms/Sidebar';
import { StatsPanel } from '@/components/organisms/StatsPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboardStats } from '@/services/dashboard';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Relatórios', href: '/reports' },
  ];

  return (
    <DashboardTemplate
      header={
        <Header
          navItems={navItems}
          onSearch={(q) => navigate(`/search?q=${q}`)}
          userName={user?.name}
        />
      }
      sidebar={<Sidebar />}
    >
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <StatsPanel data={stats} />
      )}
    </DashboardTemplate>
  );
}
```

**Por que é página**: aqui mora o "mundo real" — `useQuery`, `useAuth`, `useNavigate`. A página orquestra organismos e template, mas praticamente não renderiza JSX próprio. Esse é o sinal de uma boa página em Atomic Design: ela é um maestro, não um instrumentista.

Note também que o `Skeleton` veio direto de `@/components/ui/skeleton` (shadcn) — é um caso legítimo de "importo o primitivo direto" porque não precisa de variação customizada do design system.
