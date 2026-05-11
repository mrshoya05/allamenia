"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, Loader2, Check, CheckCheck, ShieldAlert } from "lucide-react";
import { useWs } from "@/contexts/WebSocketContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function Avatar({ user, size = 36, online = false }: { user: any; size?: number; online?: boolean }) {
  const initials = (user?.full_name || user?.username || "?")[0].toUpperCase();
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.username} className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#7856ff] text-white font-bold flex items-center justify-center w-full h-full" style={{ fontSize: size * 0.38 }}>
          {initials}
        </div>
      )}
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#000]" />}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { convId } = useParams() as { convId: string };
  const { send, connected, subscribe, unsubscribe, setUnreadMessages } = useWs();

  const [messages, setMessages] = useState<any[]>([]);
  const [conv, setConv] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [myId, setMyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use refs for values needed in callbacks to avoid stale closures
  const myIdRef = useRef("");
  const convIdRef = useRef(convId);
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<any>(null);
  const typingClear = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { myIdRef.current = myId; }, [myId]);
  useEffect(() => { convIdRef.current = convId; }, [convId]);

  // Subscribe to WS events - stable callback using refs
  useEffect(() => {
    const key = `chat-${convId}`;

    subscribe(key, (data: any) => {
      const cid = convIdRef.current;

      if (data.type === "new_message" && data.conversation_id === cid) {
        const isFromMe = data.message?.sender_id === myIdRef.current;
        if (isFromMe) {
          // Replace temp message with real one
          setMessages(prev => {
            const withoutTemps = prev.filter(m => !m.id?.startsWith("temp-"));
            if (withoutTemps.some(m => m.id === data.message.id)) return withoutTemps;
            return [...withoutTemps, data.message];
          });
        } else {
          // Message from other user - just append
          setMessages(prev => {
            if (prev.some(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }

      if (data.type === "message_sent" && data.conversation_id === cid) {
        // Sender confirmation - replace temp
        setMessages(prev => {
          const withoutTemps = prev.filter(m => !m.id?.startsWith("temp-"));
          if (withoutTemps.some(m => m.id === data.message.id)) return withoutTemps;
          return [...withoutTemps, data.message];
        });
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }

      if (data.type === "typing" && data.conversation_id === cid) {
        setIsTyping(true);
        if (typingClear.current) clearTimeout(typingClear.current);
        typingClear.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => unsubscribe(key);
  }, [convId, subscribe, unsubscribe]); // stable - no myId dependency

  useEffect(() => {
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) { router.push("/login"); return; }
    fetchData();
  }, [convId]);

  const fetchData = async () => {
    const token = localStorage.getItem("allamenia_access_token");
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [meR, msgsR, convR] = await Promise.all([
        fetch(`${API}/users/me`, { headers: h }),
        fetch(`${API}/messages/conversations/${convId}/messages`, { headers: h }),
        fetch(`${API}/messages/conversations`, { headers: h }),
      ]);

      if (meR.ok) {
        const me = await meR.json();
        setMyId(me.id);
        myIdRef.current = me.id;
      }
      if (msgsR.ok) setMessages((await msgsR.json()).messages || []);
      if (convR.ok) {
        const d = await convR.json();
        const found = d.conversations?.find((c: any) => c.id === convId);
        if (found) { setConv(found); setOtherUser(found.other_user); setIsOtherOnline(found.is_online); }
      }
      setUnreadMessages(0);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior }), 150);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    const tempId = `temp-${Date.now()}`;
    setText("");

    // Optimistic UI
    setMessages(prev => [...prev, {
      id: tempId,
      sender_id: myIdRef.current,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    }]);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    // Try WebSocket first
    const sent = send({ type: "send_message", conversation_id: convId, content });

    if (!sent) {
      // WS not ready - use REST
      const token = localStorage.getItem("allamenia_access_token");
      try {
        const res = await fetch(`${API}/messages/conversations/${convId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [
            ...prev.filter(m => m.id !== tempId),
            { ...data.message, sender_id: myIdRef.current },
          ]);
        }
      } catch (e) {
        console.error("Failed to send:", e);
      }
    }
  };

  const handleTyping = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      send({ type: "typing", conversation_id: convId });
    }, 500);
  };

  const handleAccept = async () => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/messages/conversations/${convId}/accept`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    setConv((c: any) => ({ ...c, is_request: false, request_accepted: true }));
  };

  const fmt = (d: string) => !mounted || !d ? "" : new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (d: string) => {
    if (!mounted || !d) return "";
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === yest.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isRequest = conv?.is_request && !conv?.request_accepted;
  const canSend = !isRequest || conv?.participants?.[0] === myId;

  // Build display items with date separators
  const items: any[] = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const d = msg.created_at ? new Date(msg.created_at).toDateString() : "";
    const pd = prev?.created_at ? new Date(prev.created_at).toDateString() : "";
    if (d !== pd) items.push({ _type: "date", date: msg.created_at, _id: `d${i}` });
    items.push({ _type: "msg", ...msg });
  });

  if (loading) return (
    <div className="h-screen bg-[#000] flex items-center justify-center">
      <Loader2 className="w-7 h-7 text-[#1d9bf0] animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#000] flex flex-col">
      {/* Header */}
      <div
        className="flex-shrink-0 bg-[#000]/95 backdrop-blur-xl border-b border-[#2f3336] px-4 flex items-center gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)", paddingBottom: "12px" }}
      >
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#1d1f23] flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-[#e7e9ea]" />
        </button>
        <Link href={`/profile/${otherUser?.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar user={otherUser} size={40} online={isOtherOnline} />
          <div className="min-w-0">
            <p className="font-bold text-[#e7e9ea] text-[15px] truncate">{otherUser?.full_name || otherUser?.username}</p>
            <p className="text-[12px]">
              {isOtherOnline
                ? <span className="text-green-400">Active now</span>
                : <span className="text-[#71767b]">@{otherUser?.username}</span>}
            </p>
          </div>
        </Link>
        {/* WS status */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${connected ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`}
          title={connected ? "Real-time connected" : "Reconnecting..."}
        />
      </div>

      {/* Request banner */}
      {isRequest && (
        <div className="flex-shrink-0 bg-[#f59e0b]/10 border-b border-[#f59e0b]/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] text-[#e7e9ea] font-medium">Message request from @{otherUser?.username}</p>
              <p className="text-[12px] text-[#71767b]">They can't see your messages until you accept.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleAccept} className="px-3 py-1 bg-[#1d9bf0] text-white text-[12px] font-bold rounded-full">Accept</button>
              <button onClick={() => router.back()} className="px-3 py-1 bg-[#2f3336] text-[#e7e9ea] text-[12px] font-bold rounded-full">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Avatar user={otherUser} size={72} online={isOtherOnline} />
            <p className="font-bold text-[#e7e9ea] text-[18px]">{otherUser?.full_name || otherUser?.username}</p>
            <p className="text-[#71767b] text-[14px]">@{otherUser?.username}</p>
            <p className="text-[#536471] text-[13px] mt-1">No messages yet. Say hi! 👋</p>
          </div>
        )}

        {items.map(item => {
          if (item._type === "date") return (
            <div key={item._id} className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#2f3336]" />
              <span className="text-[11px] text-[#536471] font-medium">{fmtDate(item.date)}</span>
              <div className="flex-1 h-px bg-[#2f3336]" />
            </div>
          );

          const isMe = item.sender_id === myId;
          const isTemp = item.id?.startsWith("temp-");

          return (
            <div key={item.id} className={`flex items-end gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && <div className="w-7 flex-shrink-0"><Avatar user={otherUser} size={26} /></div>}
              <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 text-[15px] leading-snug break-words ${
                  isMe
                    ? "bg-[#1d9bf0] text-white rounded-[20px] rounded-br-[5px]"
                    : "bg-[#16181c] text-[#e7e9ea] rounded-[20px] rounded-bl-[5px]"
                } ${isTemp ? "opacity-60" : ""}`}>
                  {item.content}
                </div>
                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-[11px] text-[#536471]">{fmt(item.created_at)}</span>
                  {isMe && (
                    isTemp
                      ? <div className="w-3 h-3 rounded-full border border-[#536471] border-t-transparent animate-spin" />
                      : item.is_read
                        ? <CheckCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />
                        : <Check className="w-3.5 h-3.5 text-[#536471]" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-end gap-2 mb-1.5">
            <div className="w-7"><Avatar user={otherUser} size={26} /></div>
            <div className="bg-[#16181c] rounded-[20px] rounded-bl-[5px] px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-[#536471] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      {canSend ? (
        <div className="flex-shrink-0 border-t border-[#2f3336] bg-[#000] px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-[24px] px-4 py-2.5 focus-within:border-[#1d9bf0]/40 transition-colors">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => {
                  setText(e.target.value);
                  handleTyping();
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message..."
                className="w-full bg-transparent text-[#e7e9ea] placeholder:text-[#536471] text-[15px] outline-none resize-none leading-snug"
                rows={1}
                style={{ maxHeight: 120 }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                text.trim()
                  ? "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
                  : "bg-[#1d9bf0]/20 text-[#1d9bf0]/40 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 border-t border-[#2f3336] px-4 py-4 text-center">
          <p className="text-[#71767b] text-[14px]">Accept the request to reply</p>
        </div>
      )}
    </div>
  );
}
