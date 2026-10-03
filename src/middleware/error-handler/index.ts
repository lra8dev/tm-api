// error handler middleware
import type { NextFunction, Response, Request } from "express";
import { ResponseHandler } from "../../utils";
import { envConfig } from "../../lib";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Prevent duplicate responses
  if (res.headersSent) {
    return next(err);
  }

  const isDevelopment = envConfig.NODE_ENV === "development";

  if (isDevelopment) {
    console.error("Error occurred:", err);
  }

  ResponseHandler.error(
    res,
    "INTERNAL_SERVER_ERROR",
    isDevelopment ? err.message : "An unexpected error occurred",
  );
};
