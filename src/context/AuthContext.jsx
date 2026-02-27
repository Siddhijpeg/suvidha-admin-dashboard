import { createContext, useContext, useState, useEffect } from "react";

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
    // Mock login — replace with real API call
    const mockUsers = {
      "superadmin@suvidha.gov.in": { role: "super_admin", name: "Super Admin", email: "superadmin@suvidha.gov.in" },
      "dept@suvidha.gov.in": { role: "department_admin", name: "Dept Admin", email: "dept@suvidha.gov.in" },
      "operator@suvidha.gov.in": { role: "operator", name: "Operator", email: "operator@suvidha.gov.in" },
    };
    if (mockUsers[email] && password === "Admin@123") {
      const userData = mockUsers[email];
      localStorage.setItem("suvidha_token", "mock_jwt_token_" + Date.now());
      localStorage.setItem("suvidha_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
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
