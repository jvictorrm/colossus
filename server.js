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
      "New player connected",
    );

    socket.on("game_action", async (data) => {
      try {
        // Future Drizzle ORM logic
      } catch (error) {
        logger.error(
          { event: "db_error", err: error },
          "Database failure",
        );

        if (!dev) {
          Sentry.captureException(error, {
            tags: { module: "socket.io", socketId: socket.id },
          });
        }
      }
    });

    socket.on("disconnect", () => {
      logger.warn(
        { event: "player_disconnected", socketId: socket.id },
        "Player disconnected",
      );
    });
  });

  httpServer
    .once("error", (err) => {
      logger.error(
        { event: "server_crash", err },
        "Critical HTTP server error",
      );

      if (!dev) {
        Sentry.captureException(err);
      }
      process.exit(1);
    })
    .listen(port, () => {
      logger.info(
        {
          event: "system_started",
          port,
          environment: dev ? "development" : "production",
        },
        `> Colossus server ready on port ${port}`,
      );
    });
});

