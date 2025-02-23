import { AuthProvider as Provider } from "@/hooks/useAuth";
import { SignInCredentials, User, signInSchema, userSchema } from "@/types/auth";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import useDB from "@/hooks/useDB";
import { ZodError } from "zod";

const USER_STORAGE_KEY = "fizcal_user";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const db = useDB();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load user from secure storage on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const validatedUser = userSchema.parse(parsedUser);
          setUser(validatedUser);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        // Clear invalid stored data
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate credentials
      const validatedCredentials = signInSchema.parse(credentials);

      // Query user from database
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedCredentials.email))
        .limit(1);

      const user = result[0];
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // TODO: Add password hashing and verification
      if (user.password !== validatedCredentials.password) {
        throw new Error("Invalid email or password");
      }

      // Create validated user object
      const userData: User = {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      // Store user data securely
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(new Error("Invalid credentials format"));
      } else {
        setError(err instanceof Error ? err : new Error("Failed to sign in"));
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign out"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Provider
      value={{
        user,
        signIn,
        signOut,
        isLoading,
        error,
      }}
    >
      {children}
    </Provider>
  );
}
