"use client";
import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Flame, Zap, Star } from "lucide-react";

const vibes = [
  { emoji: "🔥", text: "Fire", color: "from-orange-500 to-red-500" },
  { emoji: "⚡", text: "Electric", color: "from-yellow-400 to-orange-500" },
  { emoji: "💎", text: "Rare", color: "from-cyan-400 to-blue-500" },
  { emoji: "🌊", text: "Wavy", color: "from-blue-400 to-cyan-500" },
  { emoji: "🎯", text: "Locked In", color: "from-purple-500 to-pink-500" },
  { emoji: "✨", text: "Vibing", color: "from-pink-400 to-purple-500" },
];

export function VibeCheckWidget() {
  const [currentVibe, setCurrentVibe] = useState(0);
  const [stats, setStats] = useState({
    activeUsers: 0,
    postsToday: 0,
    vibeScore: 0,
  });

  useEffect(() => {
    // Rotate vibes every 3 seconds
    const interval = setInterval(() => {
      setCurrentVibe((prev) => (prev + 1) % vibes.length);
    }, 3000);

    // Animate stats
    animateStats();

    return () => clearInterval(interval);
  }, []);

  const animateStats = () => {
    const targetUsers = Math.floor(Math.random() * 5000) + 1000;
    const targetPosts = Math.floor(Math.random() * 500) + 100;
    const targetVibe = Math.floor(Math.random() * 30) + 70;

    let currentUsers = 0;
    let currentPosts = 0;
    let currentVibeScore = 0;

    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;

    const timer = setInterval(() => {
      currentUsers += targetUsers / steps;
      currentPosts += targetPosts / steps;
      currentVibeScore += targetVibe / steps;

      setStats({
        activeUsers: Math.floor(currentUsers),
        postsToday: Math.floor(currentPosts),
        vibeScore: Math.floor(currentVibeScore),
      });

      if (currentUsers >= targetUsers) {
        clearInterval(timer);
        setStats({
          activeUsers: targetUsers,
          postsToday: targetPosts,
          vibeScore: targetVibe,
        });
      }
    }, interval);
  };

  const vibe = vibes[currentVibe];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 border border-[#2f3336]">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <h3 className="text-[17px] font-bold text-white">Vibe Check</h3>
          </div>
          <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
            <span className="text-[12px] font-bold text-white">LIVE</span>
          </div>
        </div>

        {/* Current Vibe */}
        <div className="mb-6 text-center">
          <div className="inline-block relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${vibe.color} blur-xl opacity-50 animate-pulse`} />
            <div className="relative text-6xl mb-2 animate-bounce">
              {vibe.emoji}
            </div>
          </div>
          <p className="text-white font-bold text-[20px] mb-1">
            {vibe.text}
          </p>
          <p className="text-white/60 text-[13px]">
            Community vibe right now
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <p className="text-white/60 text-[11px] font-medium">Active</p>
            </div>
            <p className="text-white font-bold text-[16px]">
              {stats.activeUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <p className="text-white/60 text-[11px] font-medium">Posts</p>
            </div>
            <p className="text-white font-bold text-[16px]">
              {stats.postsToday.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-purple-400" />
              <p className="text-white/60 text-[11px] font-medium">Vibe</p>
            </div>
            <p className="text-white font-bold text-[16px]">
              {stats.vibeScore}%
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25">
          <span className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Join the Vibe
          </span>
        </button>

        {/* Bottom Text */}
        <p className="text-center text-white/40 text-[11px] mt-3">
          Updated every 3 seconds
        </p>
      </div>
    </div>
  );
}
