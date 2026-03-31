import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_color: string;
}

function AppContent() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("nova_token");
    const savedUser = localStorage.getItem("nova_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setChecking(false);
  }, []);

  const handleAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("nova_token");
    localStorage.removeItem("nova_user");
    setToken(null);
    setUser(null);
  };

  if (checking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#07070f]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center animate-pulse">
          <span className="text-white text-xl font-bold">N</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Auth onAuth={handleAuth} />;
  }

  return <Index user={user} onLogout={handleLogout} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;