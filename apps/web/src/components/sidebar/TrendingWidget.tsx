"use client";
import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

interface TrendingTopic {
  hashtag: string;
  posts_count: number;
  trend: "up" | "down" | "new";
}

export function TrendingWidget() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrending = async () => {
    try {
      // Mock data for now - replace with real API
      const mockTopics: TrendingTopic[] = [
        { hashtag: "Technology", posts_count: 12500, trend: "up" },
        { hashtag: "AI", posts_count: 8900, trend: "up" },
        { hashtag: "WebDev", posts_count: 6700, trend: "new" },
        { hashtag: "React", posts_count: 5400, trend: "up" },
        { hashtag: "Python", posts_count: 4200, trend: "down" },
      ];
      setTopics(mockTopics);
    } catch (error) {
      console.error("Failed to fetch trending:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-[#16181c] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2f3336]">
        <h2 className="text-[20px] font-bold text-[#e7e9ea]">Trending</h2>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-[#1d9bf0] animate-spin" />
          </div>
        ) : (
          topics.map((topic, index) => (
            <Link
              key={topic.hashtag}
              href={`/explore?q=${encodeURIComponent(topic.hashtag)}`}
              className="block px-4 py-3 hover:bg-[#1d1f23] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#71767b] text-[13px]">
                      {index + 1} · Trending
                    </span>
                    {topic.trend === "new" && (
                      <span className="px-2 py-0.5 bg-[#1d9bf0] text-white text-[11px] font-bold rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-[#e7e9ea] font-bold text-[15px] mb-1">
                    #{topic.hashtag}
                  </p>
                  <p className="text-[#71767b] text-[13px]">
                    {formatCount(topic.posts_count)} posts
                  </p>
                </div>
                <TrendingUp
                  className={`w-4 h-4 flex-shrink-0 ${
                    topic.trend === "up"
                      ? "text-[#00ba7c]"
                      : topic.trend === "down"
                      ? "text-[#f4212e] rotate-180"
                      : "text-[#1d9bf0]"
                  }`}
                />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <Link
        href="/explore"
        className="block px-4 py-3 text-[#1d9bf0] text-[15px] hover:bg-[#1d1f23] transition-colors"
      >
        Show more
      </Link>
    </div>
  );
}
