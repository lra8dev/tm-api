import { Router } from "express";
import { UserController } from "../../controllers/user";

export const userRouter: Router = Router();

userRouter.get("/:id", UserController.getUserById);
userRouter.patch("/:id", UserController.updateUser);
userRouter.delete("/:id", UserController.deleteUser);
