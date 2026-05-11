"use client";
import { useState, useRef } from "react";
import { Image as ImageIcon, Video, FileText, Smile, Send, X, Sparkles } from "lucide-react";

interface PostComposerProps {
  onSubmit: (data: {
    content: string;
    media: Array<{ type: string; url: string }>;
  }) => Promise<void>;
  placeholder?: string;
}

export function PostComposer({ onSubmit, placeholder = "What's on your mind?" }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<Array<{ type: string; url: string; file?: File }>>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 5000;
  const remaining = maxLength - content.length;

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) return;
    if (loading) return;

    setLoading(true);
    try {
      // Upload media files first if any
      const uploadedMedia = [];
      const token = localStorage.getItem("allamenia_access_token");
      console.log("Token found:", token ? "Yes" : "No");
      
      for (const item of media) {
        if (item.file) {
          // Upload the file to the server
          const formData = new FormData();
          formData.append("file", item.file);
          
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
          console.log("Uploading file to:", `${apiUrl}/posts/upload-media`);
          const response = await fetch(`${apiUrl}/posts/upload-media`, {
            method: "POST",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          });
          
          console.log("Upload response status:", response.status);
          if (response.ok) {
            const uploadedFile = await response.json();
            console.log("File uploaded successfully:", uploadedFile);
            uploadedMedia.push({
              type: item.type,
              url: uploadedFile.url,
              mime_type: uploadedFile.mime_type,
            });
          } else {
            const errorText = await response.text();
            console.error("Failed to upload file:", errorText);
            alert(`Failed to upload file: ${errorText}`);
          }
        } else {
          // If no file object, use the URL as-is (shouldn't happen normally)
          uploadedMedia.push({ type: item.type, url: item.url });
        }
      }

      console.log("Creating post with media:", uploadedMedia);
      await onSubmit({
        content: content.trim(),
        media: uploadedMedia,
      });
      setContent("");
      setMedia([]);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (type: string) => {
    // In real app, this would open file picker and upload to CDN
    // For now, just a placeholder
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : type === "video" ? "video/*" : ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In production: upload to CDN and get URL
        const url = URL.createObjectURL(file);
        setMedia([...media, { type, url, file }]);
      }
    };
    input.click();
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <div className="border-b border-slate-800/50">
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            ME
          </div>

          <div className="flex-1">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInput}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none resize-none text-slate-100 placeholder:text-slate-600 text-[17px] leading-normal min-h-[60px] max-h-[400px]"
              maxLength={maxLength}
            />

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  <div key={index} className="relative group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    {item.type === "image" && (
                      <img src={item.url} alt="" className="w-full h-48 object-cover" />
                    )}
                    {item.type === "video" && (
                      <video src={item.url} className="w-full h-48 object-cover" />
                    )}
                    {item.type === "pdf" && (
                      <div className="w-full h-48 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/90 hover:bg-slate-950 text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-3">
              <div className="flex items-center gap-1">
                {/* Image Upload */}
                <button
                  onClick={() => handleMediaUpload("image")}
                  className="p-2 rounded-full text-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Add image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Video Upload */}
                <button
                  onClick={() => handleMediaUpload("video")}
                  className="p-2 rounded-full text-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Add video"
                >
                  <Video className="w-5 h-5" />
                </button>

                {/* PDF Upload */}
                <button
                  onClick={() => handleMediaUpload("pdf")}
                  className="p-2 rounded-full text-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Add PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>

                {/* Emoji Picker */}
                <button
                  className="p-2 rounded-full text-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Character Counter */}
                {content.length > maxLength - 100 && (
                  <span
                    className={`text-sm font-medium ${
                      remaining < 0
                        ? "text-red-500"
                        : remaining < 20
                        ? "text-yellow-500"
                        : "text-slate-500"
                    }`}
                  >
                    {remaining}
                  </span>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={(!content.trim() && media.length === 0) || remaining < 0 || loading}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold rounded-full transition-all text-[15px]"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
