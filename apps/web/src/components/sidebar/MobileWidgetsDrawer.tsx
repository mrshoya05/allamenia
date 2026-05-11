"use client";
import { useState } from "react";
import { X, Sparkles, ChevronUp } from "lucide-react";
import { VibeCheckWidget } from "./VibeCheckWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { TrendingWidget } from "./TrendingWidget";
import { WhoToFollowWidget } from "./WhoToFollowWidget";

export function MobileWidgetsDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button - Bottom Right */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-br from-[#1d9bf0] to-purple-500 rounded-full shadow-2xl shadow-[#1d9bf0]/50 hover:scale-110 active:scale-95 transition-all"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        />
      )}

      {/* Drawer - Slide from Bottom */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#000000] border-t border-[#2f3336] rounded-t-3xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle Bar */}
        <div className="sticky top-0 z-10 bg-[#000000] rounded-t-3xl">
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-[#2f3336] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#2f3336]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1d9bf0]" />
              <h2 className="text-[18px] font-bold text-[#e7e9ea]">Discover</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-[#16181c] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#71767b]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: "calc(85vh - 80px)" }}>
          <VibeCheckWidget />
          <QuickActionsWidget />

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#16181c] border border-[#2f3336] rounded-full px-4 py-3 pl-12 text-[15px] text-[#e7e9ea] placeholder:text-[#71767b] focus:outline-none focus:border-[#1d9bf0] transition-colors"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71767b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <TrendingWidget />
          <WhoToFollowWidget />

          {/* Premium Card */}
          <div className="bg-gradient-to-br from-[#1d9bf0]/10 to-purple-500/10 rounded-2xl p-6 border border-[#1d9bf0]/30">
            <h3 className="text-[19px] font-bold text-[#e7e9ea] mb-2">
              Subscribe to Premium
            </h3>
            <p className="text-[14px] text-[#71767b] mb-4">
              Subscribe to unlock new features and if eligible, receive a share of ads revenue.
            </p>
            <button className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3 rounded-full transition-colors">
              Subscribe
            </button>
          </div>

          {/* Community Stats */}
          <div className="bg-[#16181c] rounded-2xl p-4 border border-[#2f3336]">
            <h3 className="text-[17px] font-bold text-[#e7e9ea] mb-3">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#71767b]">Total Users</span>
                <span className="text-[14px] font-bold text-[#e7e9ea]">1.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#71767b]">Posts Today</span>
                <span className="text-[14px] font-bold text-[#e7e9ea]">45.3K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#71767b]">Active Now</span>
                <span className="text-[14px] font-bold text-green-500">8.7K</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 text-[#71767b] text-[13px] space-y-2 pb-6">
            <div className="flex flex-wrap gap-3">
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Cookie Policy</a>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="hover:underline">Accessibility</a>
              <a href="#" className="hover:underline">Ads info</a>
              <a href="#" className="hover:underline">More</a>
            </div>
            <p className="mt-2">© 2026 Allamenia</p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
