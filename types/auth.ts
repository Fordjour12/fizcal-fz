import { z } from "zod";

export const userSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type User = z.infer<typeof userSchema>;
export type SignInCredentials = z.infer<typeof signInSchema>;
