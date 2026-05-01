import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// protect route
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(401);
      if (err.name === "TokenExpiredError") {
        throw new Error("Session expired, please log in again");
      }
      throw new Error("Not authorized, invalid token");
    }

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error("User no longer exists");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// role restriction
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Access denied. Only ${roles.join(" or ")} can do this.`),
      );
    }
    next();
  };
};
