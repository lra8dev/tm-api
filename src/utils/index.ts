import type { Response } from "express";

export class ResponseHandler {
  static success(
    res: Response,
    data: any,
    statusCode: number = 200,
    message: string = "Request successful",
  ): void {
    res.status(statusCode).json({ data, message });
  }

  static error(
    res: Response,
    errorCode: string,
    message: string,
    statusCode: number = 500,
  ): void {
    res.status(statusCode).json({ error: { code: errorCode, message } });
  }
}
