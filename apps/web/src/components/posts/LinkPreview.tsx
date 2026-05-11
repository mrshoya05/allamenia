"use client";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  preview: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
}

export function LinkPreview({ preview }: LinkPreviewProps) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-slate-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all group"
    >
      {preview.image && (
        <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
          <img
            src={preview.image}
            alt={preview.title || ""}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-4 bg-slate-900/30">
        {preview.domain && (
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs text-slate-600 uppercase tracking-wider">
              {preview.domain}
            </span>
          </div>
        )}

        {preview.title && (
          <h3 className="font-semibold text-slate-100 mb-1 line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {preview.title}
          </h3>
        )}

        {preview.description && (
          <p className="text-sm text-slate-500 line-clamp-2">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
