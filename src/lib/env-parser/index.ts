import "dotenv/config";
import { envSchema, type EnvSchema } from "../../validators/env";

const loadEnvConfig = (): EnvSchema => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missingVars = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");

    throw new Error(`Environment validation failed:\n  ${missingVars}`);
  }

  return parsed.data;
};

export const envConfig = loadEnvConfig();
