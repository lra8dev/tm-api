import type { Request, Response } from "express";
import { db } from "../../prisma/db";
import {
  taskSchema,
  TaskStatus,
  taskUpdateSchema,
} from "../../validators/task";
import { ResponseHandler } from "../../utils";
import { envConfig } from "../../lib";
import type { AuthRequest } from "../../types";
import { queryFilterSchema } from "../../validators/pagination";
import { or } from "@prisma/orm-postgres/orm-client";

export class TaskController {
  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    const { success, data, error } = taskSchema.safeParse(req.body);

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    try {
      const newTask = await db.orm.public.Task.create({
        title: data.title,
        description: data.description,
        status: data.status,
        userId: req.user!.id,
      });

      if (!newTask) {
        return ResponseHandler.error(
          res,
          "CREATION_FAILED",
          "Failed to create the task.",
        );
      }

      ResponseHandler.success(res, newTask, 201, "Task created successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error creating task:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while creating the task.",
      );
    }
  }

  static async getAllTasks(req: AuthRequest, res: Response): Promise<void> {
    const { success, data, error } = queryFilterSchema.safeParse(req.query);
    const userId = req.user!.id;

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    const { status, sort, page, limit, q } = data;
    const skip = (page - 1) * limit;

    try {
      let query = db.orm.public.Task.where({ userId });

      if (status) {
        query = query.where({ status });
      }

      if (q) {
        query = query.where((r) =>
          or(r.title.ilike(q), r.description.ilike(q)),
        );
      }

      const tasks = await query
        .offset(skip)
        .limit(limit)
        .orderBy((r) =>
          sort.startsWith("-") ? r.createdAt.asc() : r.createdAt.desc(),
        )
        .all();

      if (!tasks || tasks.length === 0) {
        return ResponseHandler.error(
          res,
          "NO_TASKS_FOUND",
          "No tasks found.",
          404,
        );
      }

      ResponseHandler.success(res, tasks, 200, "Tasks retrieved successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error fetching tasks:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while fetching the tasks.",
      );
    }
  }

  static async getTaskById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_TASK_ID",
        "Task ID is required in the request parameters.",
        400,
      );
    }

    try {
      const task = await db.orm.public.Task.where({ id }).first();

      if (!task) {
        return ResponseHandler.error(
          res,
          "TASK_NOT_FOUND",
          "Task not found.",
          404,
        );
      }

      ResponseHandler.success(res, task, 200, "Task retrieved successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error fetching task:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while fetching the task.",
      );
    }
  }

  static async updateTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_TASK_ID",
        "Task ID is required in the request parameters.",
        400,
      );
    }

    const { success, data, error } = taskUpdateSchema.safeParse(req.body);

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    const updatedData: {
      title?: string;
      description?: string;
      status?: TaskStatus;
    } = {};

    if (data.title) {
      updatedData.title = data.title;
    }

    if (data.description) {
      updatedData.description = data.description;
    }

    if (data.status) {
      updatedData.status = data.status;
    }

    try {
      const updatedTask = await db.orm.public.Task.where({ id }).update(
        updatedData,
      );

      if (!updatedTask) {
        return ResponseHandler.error(
          res,
          "UPDATE_FAILED",
          "Failed to update the task.",
        );
      }

      ResponseHandler.success(
        res,
        updatedTask,
        200,
        "Task updated successfully.",
      );
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error updating task:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while updating the task.",
      );
    }
  }

  static async deleteTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_TASK_ID",
        "Task ID is required in the request parameters.",
        400,
      );
    }

    try {
      const deletedTask = await db.orm.public.Task.where({ id }).delete();

      if (!deletedTask) {
        return ResponseHandler.error(
          res,
          "DELETE_FAILED",
          "Failed to delete the task.",
          404,
        );
      }

      ResponseHandler.success(res, null, 200, "Task deleted successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error deleting task:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while deleting the task.",
      );
    }
  }
}
