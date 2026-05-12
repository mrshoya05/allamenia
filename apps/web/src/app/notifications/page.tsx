"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { NotificationFeed } from "@/components/notifications/NotificationFeed";
import { ArrowLeft, Bell, Heart, MessageCircle, Repeat2, UserPlus, Settings } from "lucide-react";

const TABS = [
  { key: "all", label: "All", icon: Bell },
  { key: "follow_request", label: "Requests", icon: UserPlus },
  { key: "like", label: "Likes", icon: Heart },
  { key: "comment", label: "Comments", icon: MessageCircle },
  { key: "repost", label: "Reposts", icon: Repeat2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function NotificationsPage() {
  useAuthGuard();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/notifications/unread-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setCounts(await res.json());
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="pt-16 max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-16 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#2f3336]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#1d1f23]">
                <ArrowLeft className="w-5 h-5 text-[#e7e9ea]" />
              </button>
              <h1 className="text-xl font-bold text-[#e7e9ea]">Notifications</h1>
            </div>
            {counts.total > 0 && (
              <span className="text-sm text-[#71767b]">{counts.total} unread</span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label, icon: Icon }) => {
              const count = counts[key] || 0;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-[14px] font-medium whitespace-nowrap transition-colors relative flex-shrink-0 ${
                    activeTab === key ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#1d1f23]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {count > 0 && (
                    <span className="bg-[#1d9bf0] text-white text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feed */}
        <NotificationFeed
          key={activeTab}
          typeFilter={activeTab === "all" ? undefined : activeTab}
          onCountsChange={fetchCounts}
        />
      </div>
    </div>
  );
}
