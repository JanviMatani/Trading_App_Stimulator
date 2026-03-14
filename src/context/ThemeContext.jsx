import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem("pt_theme");
    return s ? s === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("pt_theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    document.body.style.background = dark ? "#1a2236" : "#f1f5f9";
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);