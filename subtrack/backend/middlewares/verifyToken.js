import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { default as UserTypeModel } from "../models/UserTypeModel.js";

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      let token = req.cookies?.token;

      if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith("Bearer ")) {
          token = req.headers.authorization.split(" ")[1];
        } else {
          token = req.headers.authorization;
        }
      }

      if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please login" });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({
          message: "Forbidden. You don't have permission",
        });
      }

      const user = await UserTypeModel.findById(
        decodedToken.id || decodedToken.userId,
      );

      if (!user || user.isActive === false) {
        return res.status(403).json({
          message: "User account is blocked or not found",
        });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Session expired. Please login again",
        });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token. Please login again",
        });
      }

      return res.status(401).json({ message: "Unauthorized. Please login" });
    }
  };
};
