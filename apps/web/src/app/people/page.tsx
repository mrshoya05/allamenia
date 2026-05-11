"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { AppNavbar } from "@/components/ui/AppNavbar";
import { UserCard } from "@/components/people/UserCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function PeoplePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"suggestions" | "search">("suggestions");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("allamenia_access_token");
    if (!token) { router.push("/login"); return; }
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/users/suggestions?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const doSearch = async (q: string) => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("allamenia_access_token");
      const res = await fetch(`${API}/users/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    const res = await fetch(`${API}/follows/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok ? res.json() : {};
  };

  const handleUnfollow = async (userId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/follows/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleBlock = async (userId: string) => {
    const token = localStorage.getItem("allamenia_access_token");
    await fetch(`${API}/blocks/${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Remove from list
    setUsers(u => u.filter(x => x.id !== userId));
    setSearchResults(u => u.filter(x => x.id !== userId));
  };

  const displayList = tab === "search" && searchQuery ? searchResults : users;

  return (
    <div className="min-h-screen bg-[#000]">
      <AppNavbar />
      <div className="pt-16 max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-16 z-10 bg-[#000]/90 backdrop-blur-xl border-b border-[#2f3336]">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#1d1f23]">
              <ArrowLeft className="w-5 h-5 text-[#e7e9ea]" />
            </button>
            <h1 className="text-xl font-bold text-[#e7e9ea]">People</h1>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71767b]" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setTab("search"); }}
                className="w-full bg-[#16181c] border border-[#2f3336] rounded-full pl-10 pr-4 py-2.5 text-[15px] text-[#e7e9ea] placeholder:text-[#71767b] focus:outline-none focus:border-[#1d9bf0]"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#2f3336]">
            <button
              onClick={() => { setTab("suggestions"); setSearchQuery(""); }}
              className={`flex-1 py-3 text-[15px] font-medium transition-colors relative ${
                tab === "suggestions" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#1d1f23]"
              }`}
            >
              Suggested
              {tab === "suggestions" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />}
            </button>
            <button
              onClick={() => setTab("search")}
              className={`flex-1 py-3 text-[15px] font-medium transition-colors relative ${
                tab === "search" ? "text-[#e7e9ea]" : "text-[#71767b] hover:bg-[#1d1f23]"
              }`}
            >
              Search
              {tab === "search" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1d9bf0] rounded-full" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {(loading || searchLoading) ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#1d9bf0] animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-16 text-[#71767b]">
              {tab === "search" && searchQuery ? "No users found" : "No suggestions available"}
            </div>
          ) : (
            displayList.map(user => (
              <UserCard
                key={user.id}
                user={user}
                followStatus={user.follow_status ?? "none"}
                onFollow={() => handleFollow(user.id)}
                onUnfollow={() => handleUnfollow(user.id)}
                onBlock={() => handleBlock(user.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
