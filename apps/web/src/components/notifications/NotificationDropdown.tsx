"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Repeat2, UserPlus, CheckCheck, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar } from "../ui/Avatar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Notification {
  id: string;
  type: string;
  actor?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  post_id?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationDropdownProps {
  onClose: () => void;
  onUpdate: () => void;
}

export function NotificationDropdown({ onClose, onUpdate }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/notifications?limit=5`, {
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

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      await fetch(`${API}/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(n => n.map(x => ({ ...x, is_read: true })));
      onUpdate();
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    const base = "w-4 h-4";
    switch (type) {
      case "like": return <Heart className={`${base} text-red-500 fill-red-500`} />;
      case "comment": return <MessageCircle className={`${base} text-blue-500`} />;
      case "repost": return <Repeat2 className={`${base} text-emerald-500`} />;
      case "follow":
      case "follow_request":
      case "follow_accepted": return <UserPlus className={`${base} text-purple-500`} />;
      default: return <Bell className={`${base} text-slate-500`} />;
    }
  };

  const getText = (notif: Notification) => {
    const name = notif.actor?.full_name || notif.actor?.username || "Someone";
    switch (notif.type) {
      case "like": return `${name} liked your post`;
      case "comment": return `${name} commented on your post`;
      case "repost": return `${name} reposted your post`;
      case "follow": return `${name} started following you`;
      case "follow_request": return `${name} wants to follow you`;
      case "follow_accepted": return `${name} accepted your follow request`;
      default: return "New notification";
    }
  };

  const getLink = (notif: Notification) => {
    if (notif.post_id) return `/post/${notif.post_id}`;
    if (notif.actor) return `/profile/${notif.actor.username}`;
    return "/notifications";
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2f3336] flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#e7e9ea]">Notifications</h3>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-[#1d9bf0] hover:text-[#1a8cd8] flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-5 h-5 text-[#1d9bf0] animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-[#71767b]">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              href={getLink(notif)}
              onClick={onClose}
              className={`block p-4 hover:bg-[#1d1f23] transition-all border-b border-[#2f3336]/50 ${
                !notif.is_read ? "bg-[#1d9bf0]/[0.04]" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  {notif.actor ? (
                    <>
                      <Avatar user={notif.actor} size={40} />
                      <div className="absolute -bottom-1 -right-1 bg-[#16181c] rounded-full p-1">
                        {getIcon(notif.type)}
                      </div>
                    </>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e7e9ea] leading-snug">
                    {getText(notif)}
                  </p>
                  <p className="text-xs text-[#71767b] mt-1">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-[#1d9bf0] rounded-full mt-2 flex-shrink-0" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <Link
        href="/notifications"
        onClick={onClose}
        className="block p-3 text-center text-sm text-[#1d9bf0] hover:bg-[#1d1f23] transition-all border-t border-[#2f3336]"
      >
        View all notifications
      </Link>
    </div>
  );
}
