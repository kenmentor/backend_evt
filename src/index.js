const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const route = require("./routes");
const { badResponse } = require("./utility/response");

// Initialize Event Sourcing
const { initAll, getRepos } = require("./event-sourcing");

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
app.use(express.json({ limit: "10mb" }));
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
  try {
    res.status(status).json(badResponse(message, status, err));
  } catch (e) {
    res.status(500).json({ data: [], error: {}, status: 500, message: "Internal server error", ok: false });
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  if (reason && reason.code === 'ECONNRESET') {
    console.warn('⚠️ MongoDB connection reset. Will auto-reconnect...');
    return;
  }
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.env.PORT || 5036;

async function startServer() {
  try {
    // Initialize Event Sourcing
    console.log('Initializing Event Sourcing...');
    await initAll();
    console.log('Event Sourcing initialized successfully');
    
    // Start Express server
    server.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
      console.log(`Socket.io listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();