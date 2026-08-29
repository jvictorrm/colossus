import Sentry from "@sentry/nextjs";
import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { logger } from "./src/lib/logger.ts";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    logger.info(
      { event: "player_connected", socketId: socket.id },
      "Novo jogador conectado",
    );

    socket.on("acao_do_jogo", async (dados) => {
      try {
        // Lógica futura do Drizzle ORM
      } catch (error) {
        logger.error(
          { event: "db_error", err: error },
          "Falha na base de dados",
        );

        if (!dev) {
          Sentry.captureException(error, {
            tags: { modulo: "socket.io", socketId: socket.id },
          });
        }
      }
    });

    socket.on("disconnect", () => {
      logger.warn(
        { event: "player_disconnected", socketId: socket.id },
        "Jogador desconectado",
      );
    });
  });

  httpServer
    .once("error", (err) => {
      logger.error(
        { event: "server_crash", err },
        "Erro crítico no servidor HTTP",
      );

      if (!dev) {
        Sentry.captureException(err);
      }
      process.exit(1);
    })
    .listen(port, () => {
      logger.info(
        {
          event: "sistema_iniciado",
          porta: port,
          ambiente: dev ? "desenvolvimento" : "producao",
        },
        `> Servidor do Colossus pronto na porta ${port}`,
      );
    });
});
