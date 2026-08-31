"use client";

import { useEffect, useState } from "react";
import { socket } from "../src/lib/socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
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
        onClick={() => socket.emit("game_action", { test: "ping" })}
        disabled={!isConnected}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Disparar Evento de Teste
      </button>
    </main>
  );
}
