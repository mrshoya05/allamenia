interface AvatarProps {
  user: {
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
    is_verified?: boolean;
  };
  size?: number;
  className?: string;
}

export function Avatar({ user, size = 40, className = "" }: AvatarProps) {
  const initials = (user.full_name || user.username || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-blue-500 to-cyan-600",
    "bg-gradient-to-br from-purple-500 to-pink-600",
    "bg-gradient-to-br from-orange-500 to-red-600",
    "bg-gradient-to-br from-yellow-500 to-orange-600",
  ];

  const colorIndex =
    (user.username?.charCodeAt(0) || 0) % colors.length;

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.username}
          className="w-full h-full rounded-full object-cover ring-2 ring-slate-800"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold ring-2 ring-slate-800 ${colors[colorIndex]}`}
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
