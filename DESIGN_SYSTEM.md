# Production-Ready Design System
## Allamenia - Advanced Social Platform

### 🎯 Design Goals
1. **Competition-Level Quality** - Match Twitter, Reddit, LinkedIn
2. **Fully Functional** - Every feature works perfectly
3. **Scalable Architecture** - Handle millions of users
4. **Modern & Clean** - Professional, not flashy
5. **Performance First** - Fast, smooth, optimized

---

## 🎨 Visual Design

### Color Palette
```css
/* Dark Theme (Primary) */
--bg-primary: #000000;      /* Pure black background */
--bg-secondary: #0a0a0a;    /* Card background */
--bg-tertiary: #141414;     /* Hover states */
--border: #1f1f1f;          /* Borders */
--text-primary: #e7e9ea;    /* Main text */
--text-secondary: #71767b;  /* Secondary text */
--text-tertiary: #4a4f54;   /* Disabled text */

/* Accent Colors */
--accent-blue: #1d9bf0;     /* Primary actions */
--accent-green: #00ba7c;    /* Success */
--accent-red: #f4212e;      /* Errors */
--accent-yellow: #ffd400;   /* Warnings */
--accent-pink: #f91880;     /* Likes */

/* Semantic Colors */
--like: #f91880;
--repost: #00ba7c;
--comment: #1d9bf0;
--bookmark: #1d9bf0;
--verified: #1d9bf0;
```

### Typography
```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

/* Font Sizes */
--text-xs: 12px;    /* Timestamps, metadata */
--text-sm: 13px;    /* Secondary text */
--text-base: 15px;  /* Body text */
--text-lg: 17px;    /* Headings */
--text-xl: 20px;    /* Page titles */
--text-2xl: 24px;   /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System
```css
/* Base: 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius
```css
--radius-sm: 4px;   /* Buttons, inputs */
--radius-md: 8px;   /* Cards */
--radius-lg: 12px;  /* Modals */
--radius-xl: 16px;  /* Large cards */
--radius-full: 9999px; /* Pills, avatars */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 8px rgba(0,0,0,0.4);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.5);
--shadow-xl: 0 16px 32px rgba(0,0,0,0.6);
```

---

## 📐 Layout Structure

### Desktop Layout (1280px+)
```
┌─────────────────────────────────────────────────────────────┐
│  Header (Fixed, 60px height)                                 │
│  [Logo] [Search] [Notifications] [Profile]                   │
├──────────┬────────────────────────────────┬──────────────────┤
│          │                                │                  │
│ Sidebar  │      Main Feed (600px)         │  Right Sidebar   │
│ (280px)  │                                │    (350px)       │
│          │  ┌──────────────────────────┐  │                  │
│ • Home   │  │  Post Composer           │  │  Trending        │
│ • Explore│  └──────────────────────────┘  │  ─────────       │
│ • Notifs │                                │  #topic1         │
│ • Messages│ ┌──────────────────────────┐  │  #topic2         │
│ • Profile│  │  Post Card               │  │                  │
│          │  │  ├─ Header               │  │  Who to Follow   │
│ [Button] │  │  ├─ Content              │  │  ─────────       │
│          │  │  ├─ Media                │  │  @user1          │
│          │  │  ├─ Actions              │  │  @user2          │
│          │  │  └─ Comments (nested)    │  │                  │
│          │  └──────────────────────────┘  │  Footer Links    │
│          │                                │                  │
└──────────┴────────────────────────────────┴──────────────────┘
```

### Tablet Layout (768px - 1279px)
```
┌─────────────────────────────────────────────┐
│  Header (Fixed)                              │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │      Main Feed (Full Width)      │
│ (Compact)│                                  │
│          │  Posts...                        │
│ [Icons]  │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│  Header (Fixed)          │
├─────────────────────────┤
│                         │
│   Main Feed             │
│   (Full Width)          │
│                         │
│   Posts...              │
│                         │
├─────────────────────────┤
│  Bottom Nav (Fixed)      │
│  [Home][Explore][+]     │
│  [Notifs][Profile]      │
└─────────────────────────┘
```

---

## 🧩 Component Specifications

### 1. Post Card
```typescript
interface PostCard {
  // Structure
  header: {
    avatar: Avatar;
    username: string;
    displayName: string;
    verified: boolean;
    timestamp: string;
    menu: DropdownMenu;
  };
  
  content: {
    text: string;
    mentions: Mention[];
    hashtags: Hashtag[];
    links: Link[];
  };
  
  media?: {
    type: 'image' | 'video' | 'gif' | 'poll';
    items: MediaItem[];
  };
  
  actions: {
    comment: { count: number; active: boolean };
    repost: { count: number; active: boolean };
    like: { count: number; active: boolean };
    bookmark: { active: boolean };
    share: {};
  };
  
  comments?: {
    preview: Comment[];
    total: number;
    expanded: boolean;
  };
}

// Dimensions
height: auto;
padding: 16px;
border-bottom: 1px solid var(--border);

// Hover State
background: var(--bg-tertiary);
transition: background 150ms ease;
```

### 2. Nested Comments
```typescript
interface Comment {
  id: string;
  author: User;
  content: string;
  likes: number;
  replies: Comment[]; // Recursive
  depth: number; // Max 10 levels
  timestamp: string;
  isLiked: boolean;
  isEdited: boolean;
}

// Visual Hierarchy
depth-0: margin-left: 0px;
depth-1: margin-left: 40px;
depth-2: margin-left: 80px;
depth-n: margin-left: (n * 40)px;
max-depth: 10;

// Collapse/Expand
- Show first 3 replies by default
- "View X more replies" button
- Collapse thread button
```

### 3. Right Sidebar Widgets

#### Trending Topics
```typescript
interface TrendingWidget {
  topics: {
    rank: number;
    hashtag: string;
    posts: number;
    trend: 'up' | 'down' | 'new';
  }[];
  
  refreshInterval: 5 * 60 * 1000; // 5 minutes
  maxItems: 10;
}
```

#### Who to Follow
```typescript
interface SuggestionsWidget {
  users: {
    avatar: string;
    username: string;
    displayName: string;
    verified: boolean;
    bio: string;
    mutualFollowers: number;
  }[];
  
  algorithm: 'similar_interests' | 'mutual_connections' | 'popular';
  maxItems: 5;
}
```

---

## 🎭 Interactions & Animations

### Micro-interactions
```css
/* Button Hover */
.button:hover {
  transform: scale(1.05);
  transition: transform 150ms ease;
}

/* Like Animation */
.like-button.active {
  animation: heartbeat 300ms ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Comment Expand */
.comment-thread {
  animation: slideDown 200ms ease;
}

/* Loading States */
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Gestures (Mobile)
- **Swipe Right**: Go back
- **Swipe Left**: Open actions menu
- **Pull Down**: Refresh feed
- **Long Press**: Quick actions menu

---

## ♿ Accessibility

### ARIA Labels
```html
<button aria-label="Like post">
<button aria-label="Comment on post">
<button aria-label="Repost">
<button aria-label="Bookmark post">
```

### Keyboard Navigation
- `Tab`: Navigate between elements
- `Enter/Space`: Activate buttons
- `Esc`: Close modals
- `?`: Show keyboard shortcuts
- `N`: New post
- `L`: Like post
- `R`: Reply to post

### Screen Reader Support
- Proper heading hierarchy
- Alt text for images
- ARIA live regions for updates
- Focus management

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## ⚡ Performance Targets

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Custom Metrics
- Time to Interactive: < 3s
- API Response Time: < 200ms
- Image Load Time: < 1s
- Smooth 60fps animations

---

## 🔒 Security & Privacy

### Data Protection
- HTTPS only
- JWT tokens (15min expiry)
- Refresh tokens (7 days)
- Rate limiting
- CSRF protection
- XSS prevention
- SQL injection prevention

### Privacy Controls
- Private accounts
- Block/Mute users
- Hide activity
- Download data
- Delete account

---

**This is the BENCHMARK we're building to! 🚀**
