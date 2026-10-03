import { z } from "zod";
import { TaskStatus } from "../task";

export const queryFilterSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(20),
  q: z.string().optional(),
  status: z.enum(TaskStatus).optional(),
  sort: z.enum(["createdAt", "-createdAt"]).default("createdAt"),
});

export type QueryFilter = z.infer<typeof queryFilterSchema>;
