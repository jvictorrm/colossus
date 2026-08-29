import { describe, expect, it } from "vitest";

describe("Motor de Regras do Colossus", () => {
  it("deve calcular o dano base de um ataque corretamente", () => {
    // Simulação de lógica que existirá no seu jogo
    const ataqueBase = 10;
    const multiplicador = 1.5;
    const danoTotal = ataqueBase * multiplicador;

    expect(danoTotal).toBe(15);
  });
});
