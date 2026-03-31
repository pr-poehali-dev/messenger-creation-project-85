import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_color: string;
}

interface AuthProps {
  onAuth: (token: string, user: User) => void;
}

const AUTH_URL = func2url.auth;

async function authRequest(payload: Record<string, string>) {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = JSON.parse(typeof text === "string" && text.startsWith('"') ? JSON.parse(text) : text);
  return { ok: res.ok, data };
}

export default function Auth({ onAuth }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    password: "",
    display_name: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await authRequest({ action: "login", ...loginForm });
      if (!ok) { setError(data.error || "Ошибка входа"); return; }
      localStorage.setItem("nova_token", data.token);
      localStorage.setItem("nova_user", JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch {
      setError("Ошибка соединения. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regForm.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    if (regForm.username.length < 3) { setError("Имя пользователя минимум 3 символа"); return; }
    setLoading(true);
    try {
      const { ok, data } = await authRequest({ action: "register", ...regForm });
      if (!ok) { setError(data.error || "Ошибка регистрации"); return; }
      localStorage.setItem("nova_token", data.token);
      localStorage.setItem("nova_user", JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch {
      setError("Ошибка соединения. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-animated-gradient overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-cyan-900/20" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 neon-glow-purple float-animation">
            <Icon name="Zap" size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-black gradient-text font-golos mb-3">NovaTalk</h1>
          <p className="text-white/50 text-lg mb-8">Мессенджер нового поколения</p>
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              { icon: "Lock", text: "Сквозное E2E шифрование" },
              { icon: "Zap", text: "Мгновенная доставка сообщений" },
              { icon: "Shield", text: "Полная конфиденциальность данных" },
              { icon: "Users", text: "Групповые чаты и каналы" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={14} className="text-purple-400" />
                </div>
                <span className="text-sm text-white/60">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center neon-glow-purple">
              <Icon name="Zap" size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black gradient-text font-golos">NovaTalk</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/25 animate-fade-in">
              <Icon name="AlertCircle" size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Login form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Логин или email</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={loginForm.login}
                    onChange={e => setLoginForm(f => ({ ...f, login: e.target.value }))}
                    placeholder="username или email"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Пароль</label>
                <div className="relative">
                  <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Введите пароль"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 neon-glow-purple mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Входим...
                  </span>
                ) : "Войти в аккаунт"}
              </button>
            </form>
          )}

          {/* Register form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Отображаемое имя</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={regForm.display_name}
                    onChange={e => setRegForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder="Иван Петров"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Имя пользователя</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                  <input
                    value={regForm.username}
                    onChange={e => setRegForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "") }))}
                    placeholder="ivan_petrov"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-8 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                <div className="relative">
                  <Icon name="Mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ivan@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Пароль</label>
                <div className="relative">
                  <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Минимум 6 символов"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/20 outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 neon-glow-purple mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Создаём аккаунт...
                  </span>
                ) : "Создать аккаунт"}
              </button>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Icon name="Lock" size={11} className="text-green-400" />
                <span className="text-xs text-white/30">Все данные защищены E2E шифрованием</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
