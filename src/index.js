const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const route = require("./routes");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

// ✅ CORS and cookies first
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

// ✅ Register routes BEFORE json parser
app.use("/", route);

// ✅ Socket.io setup
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

// Initialize chat socket handler
const { initializeChatSocket } = require("./socket/chatHandler");
const { setSocketIO } = require("./socket/emitHelper");
const chatNamespace = io.of("/chat");
initializeChatSocket(chatNamespace);
setSocketIO(io);

// ✅ Optional: apply urlencoded after json if needed
// app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5036;
server.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  console.log(`Socket.io listening on port ${PORT}`);
});