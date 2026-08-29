import { expect, test } from "@playwright/test";

test("Deve conectar dois jogadores simultaneamente via Socket.io", async ({
  browser,
}) => {
  // Cria duas sessões isoladas em memória (sem compartilhar cookies ou cache)
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Os dois "jogadores" acessam o jogo
  await page1.goto("/");
  await page2.goto("/");

  // Verifica se o hook do React capturou o evento de conexão em ambos
  await expect(page1.getByText("🟢 Online")).toBeVisible();
  await expect(page2.getByText("🟢 Online")).toBeVisible();
});
