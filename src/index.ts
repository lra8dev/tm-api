import cors from "cors";
import express from "express";
import { createServer } from "http";
import { taskRouter } from "./routes/task";
import { userRouter } from "./routes/user";
import { authRouter } from "./routes/auth";
import { authenticateToken } from "./middleware/auth-check";
import { envConfig } from "./lib/env-parser";
import { errorHandler } from "./middleware/error-handler";
import { db } from "./prisma/db";
import { connectToDatabase } from "./lib/db-connection";

export class TMServer {
  public readonly app: express.Application;
  private server: ReturnType<typeof createServer>;
  private static port: number;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    TMServer.port = envConfig.PORT;

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    this.app.use(express.json());
    this.app.use(cors({ origin: "*", credentials: true }));
  }

  private initializeRoutes() {
    this.app.get("/", (req, res) => {
      res.status(200).json({
        message: "Welcome to the Task Management API",
        api_routes: ["/api/v1/auth", "/api/v1/users", "/api/v1/tasks"],
      });
    });

    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toLocaleTimeString(),
        uptime: process.uptime(),
      });
    });

    this.app.use((_req, _res, next) => {
      connectToDatabase()
        .then(() => next())
        .catch(next);
    });

    this.app.use("/api/v1/auth", authRouter);
    this.app.use("/api/v1/users", authenticateToken, userRouter);
    this.app.use("/api/v1/tasks", authenticateToken, taskRouter);
    this.app.use((req, res) => {
      res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public async start() {
    try {
      await db.connect();
      this.server.listen(TMServer.port, () => {
        console.log(`TM Server is running on port ${TMServer.port}`);
        console.log(`Environment: ${envConfig.NODE_ENV}`);
        console.log(`Health check: http://localhost:${TMServer.port}/health`);
      });
    } catch (error) {
      console.error(`Failed to start the server: ${error}`);
      process.exit(1);
    }
  }

  public async shutdown() {
    console.log("Shutting down the server...");

    try {
      await db.close();
      this.server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    } catch (error) {
      console.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}

const server = new TMServer();

export default server.app;

if (process.env["VERCEL"] !== "1") {
  // Graceful shutdown
  process.on("SIGTERM", () => server.shutdown());
  process.on("SIGINT", () => server.shutdown());

  // Start server
  server.start().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
  });
}
