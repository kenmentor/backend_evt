const { response, userCookieVerify } = require("../utility");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { goodResponse } = require("../utility/response");
const storage = multer.memoryStorage();
const upload = multer({ storage });

require("dotenv").config();

function house_upload(req, res, next) {
  upload.fields([
    { name: "files", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ])(req, res, function (err) {
    if (err) {
      console.log("Multer error:", err);
      goodResponse.message = err.message;
      return res.status(400).json(goodResponse);
    }

    try {
      // Try cookie first, then Authorization header
      let token = req.cookies?.token;
      
      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        console.log("No token found in cookies or headers");
        goodResponse.message = "Authentication required";
        return res.status(401).json(goodResponse);
      }

      const decoded = jwt.verify(token, process.env.JWT_API_KEY);
      console.log("Token decoded:", decoded);
      
      // Handle different JWT payload structures
      req.user = { 
        id: decoded.id || decoded.userId || decoded._id || decoded.sub 
      };
      console.log("User authenticated, ID:", req.user.id);
      
      next();
    } catch (error) {
      console.error("Verification Error:", error.message);
      goodResponse.message = error.message || "Authentication failed";
      return res.status(401).json(goodResponse);
    }
  });
}

function CookieValidity(req, res, next) {
  userCookieVerify(req, res)
  next()
}

// Export as a single function for use in routes
module.exports = house_upload;
