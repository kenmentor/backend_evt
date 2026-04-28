import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import route from "./routes/index";
import { badResponse } from "./utility/response";

import { getDb } from "./event-sourcing";
import { setProjectionDb } from "./es/projection-shared";
import { ensureProjectionIndexes, createAllProjections, startProjections } from "./es/projection";
import { initDomain, getCreateHandler } from "./es/domain";
import { initProvider } from "./es/provider";

import http from "http";
import { Server } from "socket.io";

import { initializeChatSocket } from "./socket/chatHandler";
import { setSocketIO } from "./socket/emitHelper";

const app = express();

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

const chatNamespace = io.of("/chat");
initializeChatSocket(chatNamespace);
setSocketIO(io);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:", err);
  const status: number = err.status || 500;
  const message: string = err.message || "Internal server error";
  try {
    res.status(status).json(badResponse(message, status, err));
  } catch (e) {
    res.status(500).json({ data: [], error: {}, status: 500, message: "Internal server error", ok: false });
  }
});

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  if (reason && reason.code === 'ECONNRESET') {
    console.warn('⚠️ MongoDB connection reset. Will auto-reconnect...');
    return;
  }
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT: number = parseInt(process.env.PORT || "5036", 10);

async function startServer(): Promise<void> {
  try {
    console.log('Initializing ES Projections...');
    setProjectionDb(getDb()!);
    await initProvider();
    initDomain();
    await ensureProjectionIndexes();
    createAllProjections(getCreateHandler());
    startProjections();
    console.log('ES Projections initialized successfully');

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
