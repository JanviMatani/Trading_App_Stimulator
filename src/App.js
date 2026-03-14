import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }      from "./context/AuthContext";
import { ThemeProvider }               from "./context/ThemeContext";
import { AlertProvider }               from "./context/AlertContext";
import { WatchlistProvider }           from "./context/WatchlistContext";

import AuthPage        from "./pages/AuthPage";
import DashboardPage   from "./pages/DashboardPage";
import StocksPage      from "./pages/StocksPage";
import StockDetailPage from "./pages/StockDetailPage";
import TradePage       from "./pages/TradePage";
import PortfolioPage   from "./pages/PortfolioPage";
import WatchlistPage   from "./pages/WatchlistPage";
import AlertsPage      from "./pages/AlertPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AIPage          from "./pages/AIPage";
import CommunityPage   from "./pages/CommunityPage";
import NewsPage        from "./pages/NewsPage";
import ProfilePage     from "./pages/ProfilePage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WatchlistProvider>
            <AlertProvider>
              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
                @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
                @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                * { box-sizing:border-box; margin:0; padding:0; }
                ::-webkit-scrollbar       { width:4px; height:4px; }
                ::-webkit-scrollbar-track { background:transparent; }
                ::-webkit-scrollbar-thumb { background:#475569; border-radius:4px; }
                select option { background:#1e293b; }
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
              `}</style>
              <Routes>
                <Route path="/login"          element={<PublicRoute><AuthPage /></PublicRoute>} />
                <Route path="/register"       element={<PublicRoute><AuthPage /></PublicRoute>} />
                <Route path="/dashboard"      element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/stocks"         element={<PrivateRoute><StocksPage /></PrivateRoute>} />
                <Route path="/stocks/:symbol" element={<PrivateRoute><StockDetailPage /></PrivateRoute>} />
                <Route path="/trade"          element={<PrivateRoute><TradePage /></PrivateRoute>} />
                <Route path="/portfolio"      element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
                <Route path="/watchlist"      element={<PrivateRoute><WatchlistPage /></PrivateRoute>} />
                <Route path="/alerts"         element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
                <Route path="/leaderboard"    element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
                <Route path="/ai"             element={<PrivateRoute><AIPage /></PrivateRoute>} />
                <Route path="/community"      element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
                <Route path="/news"           element={<PrivateRoute><NewsPage /></PrivateRoute>} />
                <Route path="/profile"        element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="*"               element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AlertProvider>
          </WatchlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}