import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "chats" | "contacts" | "profile" | "gallery" | "search" | "settings";

interface Message {
  id: number;
  text: string;
  time: string;
  out: boolean;
  read: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  encrypted: boolean;
  typing?: boolean;
  color: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
  color: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHATS: Chat[] = [
  { id: 1, name: "Анастасия К.", avatar: "А", lastMsg: "Увидимся вечером! 🌙", time: "22:41", unread: 3, online: true, encrypted: true, typing: false, color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Команда Nova", avatar: "🚀", lastMsg: "Запуск через 3 часа", time: "21:15", unread: 7, online: true, encrypted: true, color: "from-cyan-500 to-blue-500" },
  { id: 3, name: "Дмитрий В.", avatar: "Д", lastMsg: "Код готов к ревью", time: "19:02", unread: 0, online: false, encrypted: true, color: "from-orange-500 to-red-500" },
  { id: 4, name: "Маркетинг", avatar: "📊", lastMsg: "Новые метрики за июнь", time: "17:30", unread: 2, online: true, encrypted: false, color: "from-green-500 to-teal-500" },
  { id: 5, name: "Ксения М.", avatar: "К", lastMsg: "Отчёт отправила ✅", time: "14:20", unread: 0, online: false, encrypted: true, color: "from-violet-500 to-purple-500" },
  { id: 6, name: "Алексей Н.", avatar: "А", lastMsg: "Ок, договорились", time: "12:05", unread: 0, online: true, encrypted: true, color: "from-blue-500 to-indigo-500" },
];

const MESSAGES: Message[] = [
  { id: 1, text: "Привет! Как дела с новым проектом? 👋", time: "21:30", out: false, read: true },
  { id: 2, text: "Всё идёт по плану! Уже закончил основную часть архитектуры", time: "21:32", out: true, read: true },
  { id: 3, text: "Отлично! Когда можно будет посмотреть демо?", time: "21:35", out: false, read: true },
  { id: 4, text: "Завтра утром покажу. Уже работает поиск и галерея 🎉", time: "21:38", out: true, read: true },
  { id: 5, text: "Не могу дождаться! Кстати, зашифруй наш канал — буду отправлять документы", time: "21:40", out: false, read: true },
  { id: 6, text: "Уже включено 🔒 Сквозное шифрование активно с самого начала", time: "21:41", out: true, read: true },
  { id: 7, text: "Увидимся вечером! 🌙", time: "22:41", out: false, read: false },
];

const CONTACTS: Contact[] = [
  { id: 1, name: "Анастасия К.", avatar: "А", status: "На связи", online: true, color: "from-purple-500 to-pink-500" },
  { id: 2, name: "Алексей Н.", avatar: "А", status: "Был(а) в 11:00", online: false, color: "from-blue-500 to-indigo-500" },
  { id: 3, name: "Дмитрий В.", avatar: "Д", status: "Пишет код 💻", online: true, color: "from-orange-500 to-red-500" },
  { id: 4, name: "Ксения М.", avatar: "К", status: "Был(а) вчера", online: false, color: "from-violet-500 to-purple-500" },
  { id: 5, name: "Мария О.", avatar: "М", status: "На работе", online: true, color: "from-pink-500 to-rose-500" },
  { id: 6, name: "Никита С.", avatar: "Н", status: "Не беспокоить 🎮", online: true, color: "from-green-500 to-emerald-500" },
  { id: 7, name: "Ольга П.", avatar: "О", status: "Был(а) в 09:15", online: false, color: "from-teal-500 to-cyan-500" },
];

const GALLERY_ITEMS = [
  { id: 1, bg: "from-purple-600 to-pink-600", label: "Конференция 2024", emoji: "🏙️" },
  { id: 2, bg: "from-cyan-600 to-blue-600", label: "Команда", emoji: "👥" },
  { id: 3, bg: "from-orange-600 to-red-600", label: "Хакатон", emoji: "💻" },
  { id: 4, bg: "from-green-600 to-teal-600", label: "Запуск проекта", emoji: "🚀" },
  { id: 5, bg: "from-violet-600 to-purple-600", label: "Вечеринка", emoji: "🎉" },
  { id: 6, bg: "from-pink-600 to-rose-600", label: "Поездка", emoji: "✈️" },
  { id: 7, bg: "from-indigo-600 to-blue-600", label: "Встреча", emoji: "☕" },
  { id: 8, bg: "from-emerald-600 to-green-600", label: "Природа", emoji: "🌿" },
  { id: 9, bg: "from-amber-600 to-orange-600", label: "Проект X", emoji: "⚡" },
];

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ text, color, size = "md", online }: { text: string; color: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-16 h-16 text-2xl" };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shadow-lg`}>
        {text}
      </div>
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a14] ${online ? "bg-green-400 online-dot" : "bg-gray-600"}`} />
      )}
    </div>
  );
}

// ─── Encrypt Badge ────────────────────────────────────────────────────────────
function EncryptBadge() {
  return (
    <span className="encrypt-badge">
      <Icon name="Lock" size={9} />
      E2E
    </span>
  );
}

// ─── Chat List Item ───────────────────────────────────────────────────────────
function ChatItem({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-200 group
        ${active
          ? "bg-gradient-to-r from-purple-600/20 to-cyan-600/10 border border-purple-500/30"
          : "hover:bg-white/5 border border-transparent"
        }`}
    >
      <Avatar text={chat.avatar} color={chat.color} online={chat.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-white/90 truncate">{chat.name}</span>
            {chat.encrypted && <EncryptBadge />}
          </div>
          <span className="text-xs text-white/35 flex-shrink-0">{chat.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/45 truncate">
            {chat.typing ? (
              <span className="text-purple-400 flex items-center gap-1">
                Печатает
                <span className="flex gap-0.5 ml-1">
                  <span className="typing-dot w-1 h-1 bg-purple-400 rounded-full inline-block" />
                  <span className="typing-dot w-1 h-1 bg-purple-400 rounded-full inline-block" />
                  <span className="typing-dot w-1 h-1 bg-purple-400 rounded-full inline-block" />
                </span>
              </span>
            ) : chat.lastMsg}
          </span>
          {chat.unread > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Chats Tab ────────────────────────────────────────────────────────────────
function ChatsTab({ onSelectChat, activeChat }: { onSelectChat: (c: Chat) => void; activeChat: Chat | null }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-golos gradient-text">Сообщения</h2>
          <button className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center neon-glow-purple transition-transform hover:scale-110">
            <Icon name="Plus" size={16} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            placeholder="Поиск чатов..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {CHATS.map((chat) => (
          <ChatItem key={chat.id} chat={chat} active={activeChat?.id === chat.id} onClick={() => onSelectChat(chat)} />
        ))}
      </div>
    </div>
  );
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────
function ContactsTab() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-golos gradient-text">Контакты</h2>
          <button className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center transition-transform hover:scale-110">
            <Icon name="UserPlus" size={16} className="text-white" />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input placeholder="Поиск контактов..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white/80 placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-2 pb-1">Онлайн — {CONTACTS.filter(c => c.online).length}</p>
        {CONTACTS.filter(c => c.online).map(c => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
            <Avatar text={c.avatar} color={c.color} online={c.online} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white/90">{c.name}</p>
              <p className="text-xs text-green-400/80">{c.status}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Icon name="MessageCircle" size={14} className="text-purple-400" />
            </button>
          </div>
        ))}
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-2 pb-1 pt-3">Остальные — {CONTACTS.filter(c => !c.online).length}</p>
        {CONTACTS.filter(c => !c.online).map(c => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
            <Avatar text={c.avatar} color={c.color} online={c.online} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white/60">{c.name}</p>
              <p className="text-xs text-white/30">{c.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-bold font-golos gradient-text mb-4">Профиль</h2>
      </div>
      <div className="flex flex-col items-center px-4 pb-6">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg neon-glow-purple float-animation">
            Я
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <Icon name="Camera" size={14} className="text-white" />
          </button>
        </div>
        <h3 className="text-xl font-bold text-white mb-1 font-golos">Иван Петров</h3>
        <p className="text-sm text-white/50 mb-1">@ivan_petrov</p>
        <div className="encrypt-badge mb-5">
          <Icon name="ShieldCheck" size={11} />
          Аккаунт защищён
        </div>
        <div className="w-full grid grid-cols-3 gap-3 mb-5">
          {[["Чатов", "12"], ["Контактов", "47"], ["Медиа", "284"]].map(([label, val]) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
              <p className="text-xl font-bold gradient-text font-golos">{val}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="w-full space-y-2">
          {[
            { icon: "Phone", label: "Телефон", val: "+7 999 123-45-67" },
            { icon: "Mail", label: "Email", val: "ivan@example.com" },
            { icon: "MapPin", label: "Город", val: "Москва" },
            { icon: "Calendar", label: "Дата рождения", val: "15 марта 1992" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 bg-white/4 border border-white/8 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-white/35">{item.label}</p>
                <p className="text-sm text-white/80">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm transition-transform hover:scale-[1.02] neon-glow-purple">
          Редактировать профиль
        </button>
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────
function GalleryTab() {
  const [filter, setFilter] = useState("Все");
  const filters = ["Все", "Фото", "Видео", "Файлы"];
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-bold font-golos gradient-text mb-3">Галерея</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className="aspect-square rounded-2xl cursor-pointer overflow-hidden relative group transition-transform hover:scale-[1.04]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${item.bg} flex items-center justify-center text-3xl`}>
                {item.emoji}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-[10px] font-semibold">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────
function SearchTab() {
  const [query, setQuery] = useState("");
  const results = query.length > 0
    ? CHATS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-bold font-golos gradient-text mb-4">Поиск</h2>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Люди, сообщения, файлы..."
            className="w-full bg-white/5 border border-purple-500/30 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 placeholder-white/25 outline-none focus:border-purple-500/60 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon name="X" size={14} className="text-white/40" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {query === "" ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-3">
              <Icon name="Search" size={24} className="text-purple-400" />
            </div>
            <p className="text-sm text-white/40">Введите запрос для поиска</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-white/40">Ничего не найдено</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-widest px-2 pb-2">Результаты</p>
            {results.map(chat => (
              <div key={chat.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all">
                <Avatar text={chat.avatar} color={chat.color} online={chat.online} />
                <div>
                  <p className="font-semibold text-sm text-white/90">{chat.name}</p>
                  <p className="text-xs text-white/40">{chat.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const [encrypt, setEncrypt] = useState(true);
  const [notify, setNotify] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sounds, setSounds] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${value ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${value ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  const sections = [
    {
      title: "Конфиденциальность",
      items: [
        { icon: "Lock", label: "Сквозное шифрование", sub: "E2E защита всех сообщений", value: encrypt, onChange: () => setEncrypt(v => !v), color: "from-green-500 to-emerald-500" },
        { icon: "Shield", label: "Двухфакторная аутентификация", sub: "Дополнительная защита", value: false, onChange: () => {}, color: "from-blue-500 to-cyan-500" },
      ]
    },
    {
      title: "Уведомления",
      items: [
        { icon: "Bell", label: "Push-уведомления", sub: "Получать уведомления", value: notify, onChange: () => setNotify(v => !v), color: "from-purple-500 to-pink-500" },
        { icon: "Volume2", label: "Звуки", sub: "Звуки сообщений", value: sounds, onChange: () => setSounds(v => !v), color: "from-orange-500 to-amber-500" },
      ]
    },
    {
      title: "Интерфейс",
      items: [
        { icon: "Moon", label: "Тёмная тема", sub: "Тёмное оформление", value: darkMode, onChange: () => setDarkMode(v => !v), color: "from-indigo-500 to-violet-500" },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-xl font-bold font-golos gradient-text mb-4">Настройки</h2>
      </div>
      <div className="px-3 pb-6 space-y-4">
        {sections.map(section => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-2 mb-2">{section.title}</p>
            <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 opacity-80`}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Icon name={item.icon as any} size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/85 font-medium">{item.label}</p>
                    <p className="text-xs text-white/35">{item.sub}</p>
                  </div>
                  <Toggle value={item.value} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
            {[
              { icon: "HelpCircle", label: "Помощь и поддержка", color: "from-teal-500 to-cyan-500" },
              { icon: "Info", label: "О приложении NovaTalk", color: "from-gray-500 to-slate-500" },
              { icon: "LogOut", label: "Выйти", color: "from-red-500 to-rose-500" },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center opacity-80`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Icon name={item.icon as any} size={14} className="text-white" />
                </div>
                <span className={`text-sm font-medium ${item.label === "Выйти" ? "text-red-400" : "text-white/80"}`}>{item.label}</span>
                <Icon name="ChevronRight" size={14} className="text-white/20 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat View ─────────────────────────────────────────────────────────────────
function ChatView({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      out: true,
      read: false,
    }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-animated-gradient">
      <div className="flex items-center gap-3 px-4 py-3 glass-dark border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors lg:hidden">
          <Icon name="ArrowLeft" size={16} className="text-white/70" />
        </button>
        <Avatar text={chat.avatar} color={chat.color} size="sm" online={chat.online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white truncate">{chat.name}</h3>
            {chat.encrypted && <EncryptBadge />}
          </div>
          <p className="text-xs text-white/40">
            {chat.online ? <span className="text-green-400">В сети</span> : "Не в сети"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="Phone" size={15} className="text-purple-400" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="Video" size={15} className="text-cyan-400" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Icon name="MoreVertical" size={15} className="text-white/50" />
          </button>
        </div>
      </div>

      {chat.encrypted && (
        <div className="mx-4 mt-3 mb-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/8 border border-green-500/15">
          <Icon name="Lock" size={12} className="text-green-400" />
          <span className="text-xs text-green-400/80">Сквозное шифрование включено. Сообщения защищены.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className={`max-w-[75%] ${msg.out ? "msg-bubble-out" : "msg-bubble-in"} px-4 py-2.5`}>
              <p className="text-sm text-white/90 leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] text-white/30">{msg.time}</span>
                {msg.out && (
                  <Icon name={msg.read ? "CheckCheck" : "Check"} size={11} className={msg.read ? "text-cyan-400" : "text-white/30"} />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 glass-dark border-t border-white/5 flex-shrink-0">
        <div className="flex items-end gap-2">
          <button className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5">
            <Icon name="Paperclip" size={16} className="text-white/50" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 focus:border-purple-500/40 rounded-2xl px-4 py-2.5 text-sm text-white/90 placeholder-white/25 outline-none resize-none transition-colors"
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />
          </div>
          <button className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mb-0.5">
            <Icon name="Smile" size={16} className="text-white/50" />
          </button>
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-10 h-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:scale-100 neon-glow-purple mb-0.5"
          >
            <Icon name="Send" size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-animated-gradient">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mb-5 float-animation">
        <Icon name="MessageCircle" size={36} className="text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-white/80 mb-2 font-golos">NovaTalk</h3>
      <p className="text-sm text-white/40 mb-4">Выберите чат или начните новый разговор</p>
      <div className="encrypt-badge">
        <Icon name="ShieldCheck" size={12} />
        Все чаты защищены E2E шифрованием
      </div>
    </div>
  );
}

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "gallery", icon: "Image", label: "Галерея" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Index() {
  const [tab, setTab] = useState<Tab>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  const renderSideContent = () => {
    switch (tab) {
      case "chats": return <ChatsTab onSelectChat={handleSelectChat} activeChat={activeChat} />;
      case "contacts": return <ContactsTab />;
      case "gallery": return <GalleryTab />;
      case "search": return <SearchTab />;
      case "profile": return <ProfileTab />;
      case "settings": return <SettingsTab />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#07070f] overflow-hidden">

      {/* Sidebar nav (icons) */}
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-1 bg-[#0a0a14] border-r border-white/5 z-20">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mb-4 neon-glow-purple float-animation">
          <Icon name="Zap" size={18} className="text-white" />
        </div>

        {NAV_ITEMS.map(item => {
          const isActive = tab === item.id;
          const totalUnread = item.id === "chats" ? CHATS.reduce((a, c) => a + c.unread, 0) : 0;
          return (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); if (item.id !== "chats") setShowChat(false); }}
              title={item.label}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-br from-purple-600/30 to-cyan-600/20 border border-purple-500/40 neon-glow-purple"
                  : "hover:bg-white/8 border border-transparent"
                }`}
            >
              <Icon
                name={item.icon}
                size={19}
                className={isActive ? "text-purple-300" : "text-white/40"}
              />
              {totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-transform hover:scale-110">
            Я
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className={`w-80 flex-shrink-0 border-r border-white/5 bg-[#0a0a14] flex flex-col overflow-hidden transition-all duration-300
        ${showChat ? "hidden lg:flex" : "flex"}`}
      >
        {renderSideContent()}
      </div>

      {/* Main area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${!showChat ? "hidden lg:flex" : "flex"}`}>
        {activeChat && showChat
          ? <ChatView chat={activeChat} onBack={handleBack} />
          : <EmptyState />
        }
      </div>

      {/* Bottom tabs (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 glass-dark border-t border-white/8 flex items-center justify-around px-2 lg:hidden z-30">
        {NAV_ITEMS.map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setShowChat(false); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive ? "text-purple-400" : "text-white/35"}`}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}