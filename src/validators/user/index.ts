import z from "zod";

export const userSchema = z.object({
  name: z.string().nullable().default(null),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const userUpdateSchema = z.object({
  name: z.string().nullable().default(null),
  email: z.email({ message: "Invalid email address" }).optional(),
});

export const userLoginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserUpdateScheama = z.infer<typeof userUpdateSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
