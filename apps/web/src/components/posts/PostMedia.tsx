"use client";
import { useState } from "react";
import { Play, Volume2, VolumeX, Maximize2 } from "lucide-react";

interface Media {
  type: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

interface PostMediaProps {
  media: Media[];
}

export function PostMedia({ media }: PostMediaProps) {
  if (media.length === 0) return null;

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2";
    return "grid-cols-2";
  };

  return (
    <div className={`grid ${getGridClass(media.length)} gap-2 rounded-xl overflow-hidden`}>
      {media.map((item, index) => {
        if (index >= 4) return null; // Max 4 media items

        if (item.type === "video") {
          return <VideoPlayer key={index} media={item} />;
        }

        if (item.type === "image") {
          return (
            <div
              key={index}
              className={`relative overflow-hidden bg-slate-800 ${
                media.length === 3 && index === 0 ? "row-span-2" : ""
              }`}
            >
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                loading="lazy"
              />
              {media.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-100">
                    +{media.length - 4}
                  </span>
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function VideoPlayer({ media }: { media: Media }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative bg-slate-950 rounded-xl overflow-hidden group">
      <video
        src={media.url}
        poster={media.thumbnail_url}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        onClick={() => setPlaying(!playing)}
        ref={(video) => {
          if (video) {
            if (playing) video.play();
            else video.pause();
          }
        }}
      />

      {/* Play Button Overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
          <button
            onClick={() => setPlaying(true)}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/50"
          >
            <Play className="w-8 h-8 text-slate-950 ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
          >
            {muted ? (
              <VolumeX className="w-5 h-5 text-slate-100" />
            ) : (
              <Volume2 className="w-5 h-5 text-slate-100" />
            )}
          </button>
          <button className="ml-auto p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors">
            <Maximize2 className="w-5 h-5 text-slate-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
