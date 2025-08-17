const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (res, userId) => {
  const jwtApiKey = process.env.JWT_API_KEY;

  const token = jwt.sign({ userId }, jwtApiKey, { expiresIn: "30d" });

  const isProduction = process.env.NODE_ENV === "production";

  // Set auth token cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // must be true for sameSite none
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
    domain: isProduction ? "agent-with-me-backend.onrender.com" : undefined, // undefined for local dev
  });

  // Set a simple isAuth cookie
  res.cookie("isAuth", true, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
    domain: isProduction ? "agent-with-me-backend.onrender.com" : undefined,
  });

  return res;
};
