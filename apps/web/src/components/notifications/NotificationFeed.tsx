"use client";
import { useState, useEffect } from "react";
import {
  Heart, MessageCircle, Repeat2, UserPlus, UserCheck,
  Bell, CheckCheck, Loader2, Check, X, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "../ui/Avatar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Actor {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
  bio?: string;
}

interface Notification {
  id: string;
  type: string;
  actor?: Actor;
  post_id?: string;
  comment_id?: string;
  message?: string;
  is_read: boolean;
  resolved?: boolean;
  created_at: string;
}

interface NotificationFeedProps {
  typeFilter?: string;
  onCountsChange?: () => void;
  limit?: number;
}

export function NotificationFeed({ typeFilter, onCountsChange, limit = 30 }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStates, setRequestStates] = useState<Record<string, "accepting" | "rejecting" | "done">>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const url = new URL(`${API}/notifications`);
      url.searchParams.set("limit", String(limit));
      if (typeFilter) url.searchParams.set("type_filter", typeFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
    onCountsChange?.();
  };

  const markRead = async (id: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    onCountsChange?.();
  };

  const handleAcceptRequest = async (notif: Notification) => {
    if (!notif.actor) return;
    setRequestStates(s => ({ ...s, [notif.id]: "accepting" }));
    try {
      const token = localStorage.getItem("allamenia_access_token");
      await fetch(`${API}/notifications/follow-requests/${notif.actor.id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestStates(s => ({ ...s, [notif.id]: "done" }));
      setNotifications(n => n.map(x => x.id === notif.id ? { ...x, resolved: true, is_read: true } : x));
      onCountsChange?.();
    } catch (e) {
      setRequestStates(s => { const n = { ...s }; delete n[notif.id]; return n; });
    }
  };

  const handleRejectRequest = async (notif: Notification) => {
    if (!notif.actor) return;
    setRequestStates(s => ({ ...s, [notif.id]: "rejecting" }));
    try {
      const token = localStorage.getItem("allamenia_access_token");
      await fetch(`${API}/notifications/follow-requests/${notif.actor.id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestStates(s => ({ ...s, [notif.id]: "done" }));
      setNotifications(n => n.map(x => x.id === notif.id ? { ...x, resolved: true, is_read: true } : x));
      onCountsChange?.();
    } catch (e) {
      setRequestStates(s => { const n = { ...s }; delete n[notif.id]; return n; });
    }
  };

  const formatTime = (dateString: string) => {
    if (!mounted) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (s < 60) return `${s}s`;
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    if (d < 7) return `${d}d`;
    return new Date(dateString).toLocaleDateString();
  };

  const getIcon = (type: string) => {
    const base = "w-4 h-4";
    switch (type) {
      case "like": return <Heart className={`${base} text-[#f91880] fill-[#f91880]`} />;
      case "comment": return <MessageCircle className={`${base} text-[#1d9bf0]`} />;
      case "comment_reply": return <MessageCircle className={`${base} text-[#1d9bf0]`} />;
      case "comment_like": return <Heart className={`${base} text-[#f91880] fill-[#f91880]`} />;
      case "repost": return <Repeat2 className={`${base} text-[#00ba7c]`} />;
      case "follow": return <UserCheck className={`${base} text-[#a855f7]`} />;
      case "follow_request": return <UserPlus className={`${base} text-[#f59e0b]`} />;
      case "follow_accepted": return <ShieldCheck className={`${base} text-[#00ba7c]`} />;
      case "mention": return <MessageCircle className={`${base} text-[#1d9bf0]`} />;
      default: return <Bell className={`${base} text-[#71767b]`} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "like":
      case "comment_like": return "bg-[#f91880]/15";
      case "comment":
      case "comment_reply":
      case "mention": return "bg-[#1d9bf0]/15";
      case "repost": return "bg-[#00ba7c]/15";
      case "follow":
      case "follow_accepted": return "bg-[#a855f7]/15";
      case "follow_request": return "bg-[#f59e0b]/15";
      default: return "bg-[#71767b]/15";
    }
  };

  const getText = (notif: Notification) => {
    const name = notif.actor?.full_name || notif.actor?.username || "Someone";
    switch (notif.type) {
      case "like": return <><span className="font-bold text-[#e7e9ea]">{name}</span> liked your post</>;
      case "comment": return <><span className="font-bold text-[#e7e9ea]">{name}</span> commented on your post</>;
      case "comment_reply": return <><span className="font-bold text-[#e7e9ea]">{name}</span> replied to your comment</>;
      case "comment_like": return <><span className="font-bold text-[#e7e9ea]">{name}</span> liked your comment</>;
      case "repost": return <><span className="font-bold text-[#e7e9ea]">{name}</span> reposted your post</>;
      case "follow": return <><span className="font-bold text-[#e7e9ea]">{name}</span> started following you</>;
      case "follow_request": return <><span className="font-bold text-[#e7e9ea]">{name}</span> wants to follow you</>;
      case "follow_accepted": return <><span className="font-bold text-[#e7e9ea]">{name}</span> accepted your follow request</>;
      case "mention": return <><span className="font-bold text-[#e7e9ea]">{name}</span> mentioned you in a post</>;
      case "system": return <span className="text-[#e7e9ea]">{notif.message || "System notification"}</span>;
      default: return <span className="text-[#e7e9ea]">New notification</span>;
    }
  };

  const getLink = (notif: Notification) => {
    if (notif.post_id) return `/post/${notif.post_id}`;
    if (notif.actor) return `/profile/${notif.actor.username}`;
    return "#";
  };

  const hasUnread = notifications.some(n => !n.is_read);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
          <Bell className="w-8 h-8 text-[#1d9bf0]" />
        </div>
        <p className="text-[#71767b] text-[15px]">No notifications yet</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mark all read */}
      {hasUnread && (
        <div className="flex justify-end px-4 py-2 border-b border-[#2f3336]">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[13px] text-[#1d9bf0] hover:text-[#1a8cd8] font-medium"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((notif) => {
        const isFollowRequest = notif.type === "follow_request";
        const reqState = requestStates[notif.id];
        const isDone = reqState === "done" || notif.resolved;

        return (
          <div
            key={notif.id}
            className={`relative border-b border-[#2f3336]/60 transition-colors ${
              !notif.is_read ? "bg-[#1d9bf0]/[0.04]" : "hover:bg-[#080808]"
            }`}
            onClick={() => !notif.is_read && markRead(notif.id)}
          >
            {/* Unread dot */}
            {!notif.is_read && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#1d9bf0]" />
            )}

            <div className="flex gap-3 px-4 py-4 pl-6">
              {/* Icon + Avatar */}
              <div className="flex-shrink-0 relative">
                {notif.actor ? (
                  <>
                    <Link href={`/profile/${notif.actor.username}`} onClick={e => e.stopPropagation()}>
                      <Avatar user={notif.actor} size={44} />
                    </Link>
                    <div className={`absolute -bottom-1 -right-1 rounded-full p-1 ${getIconBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                  </>
                ) : (
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#71767b] leading-snug">
                  {getText(notif)}
                </p>
                <p className="text-[12px] text-[#536471] mt-1">{formatTime(notif.created_at)}</p>

                {/* Follow request actions */}
                {isFollowRequest && !isDone && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAcceptRequest(notif); }}
                      disabled={!!reqState}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-[13px] font-bold rounded-full transition-all disabled:opacity-60"
                    >
                      {reqState === "accepting" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRejectRequest(notif); }}
                      disabled={!!reqState}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2f3336] hover:bg-[#3a3d40] text-[#e7e9ea] text-[13px] font-bold rounded-full transition-all disabled:opacity-60"
                    >
                      {reqState === "rejecting" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                )}

                {/* Done state */}
                {isFollowRequest && isDone && (
                  <p className="text-[12px] text-[#536471] mt-2 italic">
                    {reqState === "done" && !notif.resolved ? "Request handled" : "Resolved"}
                  </p>
                )}
              </div>

              {/* Post thumbnail if available */}
              {notif.post_id && !isFollowRequest && (
                <Link
                  href={getLink(notif)}
                  onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#16181c] border border-[#2f3336] flex items-center justify-center hover:border-[#536471] transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#536471]" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
