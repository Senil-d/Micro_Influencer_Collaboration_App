import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import {
  clearStorage,
  getToken,
  getUser,
  saveToken,
  saveUser,
} from "../utils/storage.js";

// Create Context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore Session On App Launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Register
  const register = async (name, email, password, role) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      const { token, user } = response.data;

      await saveToken(token);
      await saveUser(user);

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, user } = response.data;

      await saveToken(token);
      await saveUser(user);

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await clearStorage();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Update User State
  const updateUserState = async (updatedUser) => {
    try {
      await saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user state:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        register,
        login,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
