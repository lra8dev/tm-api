import { db } from "../../prisma/db";

let databaseConnection: Promise<unknown> | undefined;

export const connectToDatabase = (): Promise<unknown> => {
  if (!databaseConnection) {
    databaseConnection = db.connect().catch((error: unknown) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
};
