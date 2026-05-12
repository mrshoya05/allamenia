"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Loader2, MessageCircle, Edit, Search } from "lucide-react";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { useWs } from "@/contexts/WebSocketContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function Avatar({ user, size = 52, online = false }: { user: any; size?: number; online?: boolean }) {
  const initials = (user?.full_name || user?.username || "?")[0].toUpperCase();
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.username} className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] text-white font-bold flex items-center justify-center w-full h-full" style={{ fontSize: size * 0.36 }}>
          {initials}
        </div>
      )}
      {online && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#000]" />}
    </div>
  );
}

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const days = Math.floor(h / 24);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  useAuthGuard();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { subscribe, unsubscribe } = useWs();

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time: update conversation list when new message arrives
  useEffect(() => {
    subscribe("inbox", (data: any) => {
      if (data.type === "new_message") {
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === data.conversation_id) {
              return {
                ...c,
                last_message: data.message.content,
                last_message_at: data.message.created_at,
                unread_count: (c.unread_count || 0) + 1,
              };
            }
            return c;
          });
          // Sort by latest
          return updated.sort((a, b) =>
            new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
          );
        });
      }
    });
    return () => unsubscribe("inbox");
  }, [subscribe, unsubscribe]);

  const fetchConversations = async () => {
    const token = localStorage.getItem("allamenia_access_token");
    try {
      const res = await fetch(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const u = c.other_user;
    return (u?.username || "").toLowerCase().includes(q) || (u?.full_name || "").toLowerCase().includes(q);
  });

  const requests = filtered.filter(c => c.is_request);
  const dms = filtered.filter(c => !c.is_request);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="pt-16 max-w-2xl mx-auto">

        {/* Header */}
        <div className="sticky top-16 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#2f3336]">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-[#e7e9ea]">Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-[#1d9bf0] text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <Link href="/messages/new" className="p-2 rounded-full hover:bg-[#1d1f23] transition-colors">
              <Edit className="w-5 h-5 text-[#e7e9ea]" />
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#536471]" />
              <input
                type="text"
                placeholder="Search messages"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#16181c] border border-[#2f3336] rounded-full pl-9 pr-4 py-2 text-[14px] text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-[#1d9bf0]" />
            </div>
            <h2 className="text-[20px] font-bold text-[#e7e9ea]">No messages yet</h2>
            <p className="text-[#71767b] text-[15px] text-center max-w-xs">
              Visit someone's profile and tap the message button to start a conversation.
            </p>
          </div>
        ) : (
          <>
            {requests.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-[#2f3336] flex items-center gap-2">
                  <h2 className="text-[15px] font-bold text-[#e7e9ea]">Message requests</h2>
                  <span className="bg-[#f59e0b]/20 text-[#f59e0b] text-[11px] font-bold rounded-full px-2 py-0.5">{requests.length}</span>
                </div>
                {requests.map(conv => <ConvRow key={conv.id} conv={conv} />)}
              </div>
            )}

            {dms.length > 0 && (
              <div>
                {requests.length > 0 && (
                  <div className="px-4 py-3 border-b border-[#2f3336]">
                    <h2 className="text-[15px] font-bold text-[#e7e9ea]">Direct messages</h2>
                  </div>
                )}
                {dms.map(conv => <ConvRow key={conv.id} conv={conv} />)}
              </div>
            )}

            {filtered.length === 0 && search && (
              <div className="text-center py-12 text-[#71767b]">No results for "{search}"</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConvRow({ conv }: { conv: any }) {
  const user = conv.other_user;
  const hasUnread = conv.unread_count > 0;

  return (
    <Link
      href={`/messages/${conv.id}`}
      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#080808] transition-colors border-b border-[#2f3336]/40 ${hasUnread ? "bg-[#1d9bf0]/[0.03]" : ""}`}
    >
      <Avatar user={user} size={52} online={conv.is_online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-[15px] truncate ${hasUnread ? "font-bold text-[#e7e9ea]" : "font-medium text-[#e7e9ea]"}`}>
            {user?.full_name || user?.username}
          </span>
          <span className="text-[12px] text-[#536471] flex-shrink-0 ml-2">{formatTime(conv.last_message_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[14px] truncate ${hasUnread ? "text-[#e7e9ea]" : "text-[#71767b]"}`}>
            {conv.is_request ? "📩 Message request" : (conv.last_message || "Tap to start chatting")}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 min-w-[20px] h-5 bg-[#1d9bf0] rounded-full text-white text-[11px] font-bold flex items-center justify-center px-1.5">
              {conv.unread_count > 9 ? "9+" : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
