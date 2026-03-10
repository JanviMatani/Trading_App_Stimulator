import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage       from "./pages/AuthPage";
import DashboardPage  from "./pages/DashboardPage";
import StocksPage     from "./pages/StocksPage";
import TradePage      from "./pages/TradePage";
import PortfolioPage  from "./pages/PortfolioPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AIPage         from "./pages/AIPage";
import CommunityPage  from "./pages/CommunityPage";
import NewsPage       from "./pages/NewsPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
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
      <AuthProvider>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #1e293b; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: #1e293b; }
          ::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
          select option { background: #334155; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        `}</style>
        <Routes>
          <Route path="/login"       element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/register"    element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/stocks"      element={<PrivateRoute><StocksPage /></PrivateRoute>} />
          <Route path="/trade"       element={<PrivateRoute><TradePage /></PrivateRoute>} />
          <Route path="/portfolio"   element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
          <Route path="/ai"          element={<PrivateRoute><AIPage /></PrivateRoute>} />
          <Route path="/community"   element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
          <Route path="/news"        element={<PrivateRoute><NewsPage /></PrivateRoute>} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}