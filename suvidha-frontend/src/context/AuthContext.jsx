import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("suvidha_token");
    const savedUser = localStorage.getItem("suvidha_user");
    const savedTheme = localStorage.getItem("suvidha_theme");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
  try {
    const result = await authService.login(email, password);
    if (result?.session?.access_token) {
      localStorage.setItem("suvidha_token", result.session.access_token);
      localStorage.setItem("suvidha_user", JSON.stringify(result.user.user_metadata));
      setUser(result.user.user_metadata);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (err) {
    return { success: false, error: err.message || "Login failed. Please try again." };
  }
};

  const logout = () => {
    localStorage.removeItem("suvidha_token");
    localStorage.removeItem("suvidha_user");
    setUser(null);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("suvidha_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);