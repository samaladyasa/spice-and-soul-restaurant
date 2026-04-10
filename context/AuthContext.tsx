"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import "@/amplify-config";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signOut as amplifySignOut,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  resendSignUpCode,
} from "aws-amplify/auth";

interface AuthContextType {
  username: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  confirmSignup: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmNewPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  userEmail: null,
  isAdmin: false,
  loading: true,
  getIdToken: async () => null,
  login: async () => {},
  signup: async () => {},
  confirmSignup: async () => {},
  resendCode: async () => {},
  forgotPassword: async () => {},
  confirmNewPassword: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      await getCurrentUser();
      const session = await fetchAuthSession();
      const attrs = await fetchUserAttributes();

      const name = attrs.name || attrs.email?.split("@")[0] || null;
      const email = attrs.email || null;

      setUsername(name);
      setUserEmail(email);

      const groups = (session.tokens?.idToken?.payload?.["cognito:groups"] as string[]) || [];
      setIsAdmin(groups.includes("admin"));

      if (name) localStorage.setItem("username", name);
      if (email) localStorage.setItem("userEmail", email);
    } catch {
      setUsername(null);
      setUserEmail(null);
      setIsAdmin(false);
      localStorage.removeItem("username");
      localStorage.removeItem("userEmail");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const getIdToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    await amplifySignIn({ username: email, password });
    await refreshUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await amplifySignUp({
      username: email,
      password,
      options: { userAttributes: { email, name } },
    });
  };

  const confirmSignup = async (email: string, code: string) => {
    await amplifyConfirmSignUp({ username: email, confirmationCode: code });
  };

  const resendCode = async (email: string) => {
    await resendSignUpCode({ username: email });
  };

  const forgotPassword = async (email: string) => {
    await amplifyResetPassword({ username: email });
  };

  const confirmNewPassword = async (email: string, code: string, newPassword: string) => {
    await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
  };

  const logout = async () => {
    await amplifySignOut();
    setUsername(null);
    setUserEmail(null);
    setIsAdmin(false);
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        userEmail,
        isAdmin,
        loading,
        getIdToken,
        login,
        signup,
        confirmSignup,
        resendCode,
        forgotPassword,
        confirmNewPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
