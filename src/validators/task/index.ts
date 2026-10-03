import z from "zod";

export enum TaskStatus {
  COMPLETED = "completed",
  PENDING = "pending",
  CANCELLED = "cancelled",
}

export const taskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().nullable().default(null),
  status: z.enum(TaskStatus).default(TaskStatus.PENDING),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).optional(),
  description: z.string().nullable().default(null),
  status: z.enum(TaskStatus).default(TaskStatus.PENDING),
});

export type TaskSchema = z.infer<typeof taskSchema>;
export type TaskUpdateSchema = z.infer<typeof taskUpdateSchema>;
