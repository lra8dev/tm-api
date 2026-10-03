import { Router } from "express";
import { TaskController } from "../../controllers/task";

export const taskRouter: Router = Router();

taskRouter.post("/", TaskController.createTask);
taskRouter.get("/:id", TaskController.getTaskById);
taskRouter.get("/", TaskController.getAllTasks);
taskRouter.patch("/:id", TaskController.updateTask);
taskRouter.delete("/:id", TaskController.deleteTask);
