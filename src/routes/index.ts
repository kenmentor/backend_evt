import { Router, Request, Response, NextFunction } from "express";
import v1 from "./v1";
import { badResponse } from "../utility/response";

const route = Router();

route.use("/v1", v1);

route.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Route handler error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  try {
    res.status(status).json(badResponse(message, status, err));
  } catch (e) {
    res.status(500).json({ data: [], error: {}, status: 500, message: "Internal server error", ok: false });
  }
});

export default route;
