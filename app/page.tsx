"use client";

import { useEffect, useState } from "react";
import { socket } from "../src/lib/socket"; // Ajuste o caminho se a sua page.tsx estiver em outro nível

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicia a comunicação com o server.js
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      // Desconecta automaticamente se o jogador fechar a aba ou mudar de rota
      socket.disconnect();
    };
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Colossus</h1>
      <p>
        Status da Conexão:{" "}
        <strong>{isConnected ? "🟢 Online" : "🔴 Offline"}</strong>
      </p>

      <button
        type="button"
        onClick={() => socket.emit("acao_do_jogo", { teste: "ping" })}
        disabled={!isConnected}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Disparar Evento de Teste
      </button>
    </main>
  );
}
