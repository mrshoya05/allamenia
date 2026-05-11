export function PostSkeleton() {
  return (
    <div className="relative group animate-pulse">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl blur" />
      
      <div className="relative p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800/50 rounded-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-800/50" />
          <div className="flex-1">
            <div className="h-4 bg-slate-800/50 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-800/50 rounded w-24" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-800/50 rounded w-full" />
          <div className="h-4 bg-slate-800/50 rounded w-5/6" />
          <div className="h-4 bg-slate-800/50 rounded w-4/6" />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <div className="h-8 bg-slate-800/50 rounded w-16" />
          <div className="h-8 bg-slate-800/50 rounded w-16" />
          <div className="h-8 bg-slate-800/50 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
