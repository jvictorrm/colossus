import next from "next";
import { createServer } from "node:http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`[Socket] Novo jogador conectado: ${socket.id}`);

    socket.on("ping", () => {
      socket.emit("pong", "Hello World do Socket.io!");
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Jogador desconectado: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Servidor pronto em http://${hostname}:${port}`);
    });
});
