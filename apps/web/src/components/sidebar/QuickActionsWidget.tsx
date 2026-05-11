"use client";
import { Plus, Image, Video, Calendar, Zap, Gift } from "lucide-react";

export function QuickActionsWidget() {
  const actions = [
    {
      icon: Plus,
      label: "Create Post",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      hoverColor: "hover:bg-blue-500/20",
    },
    {
      icon: Image,
      label: "Share Photo",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      hoverColor: "hover:bg-purple-500/20",
    },
    {
      icon: Video,
      label: "Go Live",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      hoverColor: "hover:bg-red-500/20",
    },
    {
      icon: Calendar,
      label: "Schedule",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      hoverColor: "hover:bg-green-500/20",
    },
  ];

  return (
    <div className="bg-[#16181c] rounded-2xl overflow-hidden border border-[#2f3336]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-[#e7e9ea]">Quick Actions</h2>
        <Zap className="w-4 h-4 text-yellow-400" />
      </div>

      {/* Actions Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`relative group ${action.bgColor} ${action.hoverColor} rounded-xl p-4 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/10`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full bg-gradient-to-br ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] font-medium text-[#e7e9ea]">
                {action.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Daily Challenge */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Gift className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-bold text-[#e7e9ea] mb-1">
              Daily Challenge
            </h3>
            <p className="text-[12px] text-[#71767b] mb-2">
              Post 3 times today to earn 50 bonus points!
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#2f3336] rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />
              </div>
              <span className="text-[11px] font-bold text-yellow-400">1/3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
