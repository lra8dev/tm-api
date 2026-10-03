import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };
import { envConfig } from "../lib";

export const db = postgres<Contract>({
  contractJson,
  url: envConfig.DATABASE_URL,
});
