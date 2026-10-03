import type { Request, Response } from "express";
import { db } from "../../prisma/db";
import { userUpdateSchema } from "../../validators/user";
import { ResponseHandler } from "../../utils";
import { envConfig } from "../../lib";

export class UserController {
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_USER_ID",
        "User ID is required in the request parameters.",
        400,
      );
    }

    try {
      const user = await db.orm.public.User.include("tasks")
        .where({ id })
        .first();

      if (!user) {
        return ResponseHandler.error(
          res,
          "USER_NOT_FOUND",
          `No user found with the provided ID: ${id}.`,
          404,
        );
      }

      ResponseHandler.success(res, user, 200, "User retrieved successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error retrieving user:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while retrieving the user.",
      );
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_USER_ID",
        "User ID is required in the request parameters.",
        400,
      );
    }

    const { success, data, error } = userUpdateSchema.safeParse(req.body);

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    const userData: { email?: string; name?: string } = {};

    if (data.email) {
      userData.email = data.email;
    }

    if (data.name) {
      userData.name = data.name;
    }

    try {
      const updatedUser = await db.orm.public.User.where({ id }).update(
        userData,
      );

      if (!updatedUser) {
        return ResponseHandler.error(
          res,
          "UPDATE_FAILED",
          "Failed to update the user.",
        );
      }

      ResponseHandler.success(
        res,
        updatedUser,
        200,
        "User updated successfully.",
      );
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error updating user:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while updating the user.",
      );
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return ResponseHandler.error(
        res,
        "MISSING_USER_ID",
        "User ID is required in the request parameters.",
        400,
      );
    }

    try {
      const deletedUser = await db.orm.public.User.where({ id }).delete();

      if (!deletedUser) {
        return ResponseHandler.error(
          res,
          "DELETE_FAILED",
          "Failed to delete the user.",
          404,
        );
      }

      ResponseHandler.success(res, null, 200, "User deleted successfully.");
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error deleting user:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while deleting the user.",
      );
    }
  }
}
