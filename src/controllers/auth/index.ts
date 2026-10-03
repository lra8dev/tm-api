import { db } from "../../prisma/db";
import type { Request, Response } from "express";
import { userLoginSchema, userSchema } from "../../validators/user";
import { ResponseHandler } from "../../utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { envConfig } from "../../lib";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { success, data, error } = userSchema.safeParse(req.body);

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    try {
      const existingUser = await db.orm.public.User.select("id")
        .where({
          email: data.email,
        })
        .first();

      if (existingUser) {
        return ResponseHandler.error(
          res,
          "USER_ALREADY_EXISTS",
          "A user with this email already exists.",
          409,
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);

      const newUser = await db.orm.public.User.create({
        email: data.email,
        name: data.name,
        password: hashedPassword,
      });

      const accessToken = jwt.sign(
        { id: newUser.id, email: newUser.email },
        envConfig.JWT_SECRET,
      );

      return ResponseHandler.success(
        res,
        { ...newUser, password: null, token: accessToken },
        201,
        "User registered successfully.",
      );
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error during user registration:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while registering the user.",
      );
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { success, data, error } = userLoginSchema.safeParse(req.body);

    if (!success) {
      return ResponseHandler.error(
        res,
        "VALIDATION_ERROR",
        error.issues.map((err) => err.message).join(", "),
        400,
      );
    }

    try {
      const user = await db.orm.public.User.select("id", "email", "password")
        .where({ email: data.email })
        .first();

      if (!user || !user.password) {
        return ResponseHandler.error(
          res,
          "USER_NOT_FOUND",
          "No user found with the provided email.",
          401,
        );
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        return ResponseHandler.error(
          res,
          "INVALID_PASSWORD",
          "The provided password is incorrect",
          401,
        );
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        envConfig.JWT_SECRET,
      );

      ResponseHandler.success(
        res,
        { ...user, token: accessToken },
        200,
        "User logged in successfully.",
      );
    } catch (error) {
      const isDevelopment = envConfig.NODE_ENV === "development";

      if (isDevelopment) {
        console.error("Error during user login:", error);
      }

      ResponseHandler.error(
        res,
        "INTERNAL_SERVER_ERROR",
        "An error occurred while logging in the user.",
      );
    }
  }
}
