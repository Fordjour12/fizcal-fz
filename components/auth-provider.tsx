import { AuthProvider as Provider } from "@/hooks/useAuth";
import { useCallback, useState } from "react";
import * as SecureStore from "expo-secure-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<{ id: string } | null>(() => {
    // In a real app, you would check SecureStore for existing session
    return { id: "temp-user-id" }; // Temporary for development
  });
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Implement actual authentication logic here
      const userData = { id: "temp-user-id" };
      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync("user");
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
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
      }}
    >
      {children}
    </Provider>
  );
}
