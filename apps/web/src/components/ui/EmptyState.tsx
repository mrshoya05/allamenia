import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="relative group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-purple-500/5 rounded-2xl blur-xl animate-pulse" />
      
      <div className="relative flex flex-col items-center justify-center py-16 px-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl">
        {/* Icon with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center border border-emerald-500/30">
            <Icon className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
        <p className="text-slate-500 text-center max-w-md mb-6">{description}</p>

        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
