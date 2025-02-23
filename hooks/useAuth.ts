import { SignInCredentials, User, signInSchema, userSchema } from "@/types/auth";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createContext, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import useDB from "./useDB";
import { z } from "zod";

interface AuthContextType {
  user: User | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = "fizcal_user";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = AuthContext.Provider;
