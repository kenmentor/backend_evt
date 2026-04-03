const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const route = require("./routes");
const { badResponse } = require("./utility/response");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

app.use(
  cors({
    origin: [
      "https://agent-with-me-frountend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://agent-with-me-v2.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", route);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://agent-with-me-frountend.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://agent-with-me-v2.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const { initializeChatSocket } = require("./socket/chatHandler");
const { setSocketIO } = require("./socket/emitHelper");
const chatNamespace = io.of("/chat");
initializeChatSocket(chatNamespace);
setSocketIO(io);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json(badResponse(message, status, err));
});

const PORT = process.env.PORT || 5036;
server.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening on port ${PORT}`);
});