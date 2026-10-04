import type { NextFunction, Response } from "express";
import { ResponseHandler } from "../../utils";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import { envConfig } from "../../lib/env-parser";
import type { AuthRequest } from "../../types";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ResponseHandler.error(
        res,
        "UNAUTHORIZED",
        "No token provided",
        401,
      );
    }

    jwt.verify(
      token,
      envConfig.JWT_SECRET,
      (err: VerifyErrors | null, decoded?: string | JwtPayload) => {
        if (err) {
          return ResponseHandler.error(
            res,
            "INVALID_OR_EXPIRED_TOKEN",
            "Invalid or Expired Token",
            403,
          );
        }

        const user = decoded as AuthRequest["user"];

        req.user = {
          id: user!.id,
          email: user!.email,
        };

        next();
      },
    );
  } catch (error) {
    const isDevelopment = envConfig.NODE_ENV === "development";

    if (isDevelopment) {
      console.error("Error during token authentication:", error);
    }

    next(new Error("An error occurred during token authentication"));
  }
};
