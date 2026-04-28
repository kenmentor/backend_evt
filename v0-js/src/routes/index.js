const express = require("express");
const route = express.Router();
const v1 = require("./v1");

route.use("/v1", v1);

route.use((err, req, res, next) => {
  console.error("Route handler error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  try {
    res.status(status).json(badResponse(message, status, err));
  } catch (e) {
    res.status(500).json({ data: [], error: {}, status: 500, message: "Internal server error", ok: false });
  }
});

module.exports = route;
