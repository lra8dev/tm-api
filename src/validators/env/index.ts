import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform((val) => parseInt(val, 10)),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
});

export type EnvSchema = z.infer<typeof envSchema>;
