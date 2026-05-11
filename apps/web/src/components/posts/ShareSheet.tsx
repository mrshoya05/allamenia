"use client";
import { useState, useEffect } from "react";
import { X, Link2, Check, MessageCircle } from "lucide-react";

interface ShareSheetProps {
  postId: string;
  postContent?: string;
  authorUsername?: string;
  onClose: () => void;
}

const SHARE_OPTIONS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20",
    border: "border-[#25D366]/30",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    color: "#000000",
    bg: "bg-white/10 hover:bg-white/20",
    border: "border-white/20",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#2AABEE",
    bg: "bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20",
    border: "border-[#2AABEE]/30",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#2AABEE">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    bg: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20",
    border: "border-[#1877F2]/30",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    bg: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20",
    border: "border-[#0A66C2]/30",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    getUrl: (url: string, text: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export function ShareSheet({ postId, postContent = "", authorUsername = "", onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`;
  const shareText = postContent
    ? `${postContent.slice(0, 100)}${postContent.length > 100 ? "..." : ""}`
    : `Check out this post by @${authorUsername}`;

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTo = (option: typeof SHARE_OPTIONS[0]) => {
    const url = option.getUrl(postUrl, shareText);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#16181c] rounded-t-3xl border-t border-[#2f3336] max-w-lg mx-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[#536471] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h3 className="text-[17px] font-bold text-[#e7e9ea]">Share post</h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-[#2f3336] transition-colors"
            >
              <X className="w-5 h-5 text-[#71767b]" />
            </button>
          </div>

          {/* Share options grid */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-5 gap-3 mb-5">
              {SHARE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShareTo(option)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${option.bg} ${option.border}`}
                >
                  {option.icon}
                  <span className="text-[11px] text-[#71767b] font-medium leading-tight text-center">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Copy link */}
            <div className="flex items-center gap-3 bg-[#000] border border-[#2f3336] rounded-2xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#71767b] mb-0.5">Post link</p>
                <p className="text-[13px] text-[#e7e9ea] truncate">{postUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all flex-shrink-0 ${
                  copied
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Safe area for mobile */}
          <div className="h-safe-area-inset-bottom pb-4" />
        </div>
      </div>
    </>
  );
}
