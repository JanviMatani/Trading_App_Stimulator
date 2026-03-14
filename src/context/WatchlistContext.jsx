import { createContext, useContext, useState, useCallback } from "react";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pt_watchlist") || '["AAPL","MSFT","NVDA"]'); }
    catch { return ["AAPL","MSFT","NVDA"]; }
  });

  const add = useCallback((symbol) => {
    setWatchlist((p) => {
      const next = p.includes(symbol.toUpperCase()) ? p : [...p, symbol.toUpperCase()];
      localStorage.setItem("pt_watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((symbol) => {
    setWatchlist((p) => {
      const next = p.filter((s) => s !== symbol.toUpperCase());
      localStorage.setItem("pt_watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggle = useCallback((symbol) => {
    setWatchlist((p) => {
      const sym = symbol.toUpperCase();
      const next = p.includes(sym) ? p.filter((s) => s !== sym) : [...p, sym];
      localStorage.setItem("pt_watchlist", JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback((symbol) => watchlist.includes(symbol.toUpperCase()), [watchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove, toggle, has }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);