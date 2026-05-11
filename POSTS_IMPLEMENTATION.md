# Posts System - Complete Implementation Guide

## ✅ What's Been Created

### Backend (Python/FastAPI)
1. ✅ `posts/model.py` - Post schema with media support
2. ✅ `posts/interactions_model.py` - Likes, bookmarks, views
3. ✅ `posts/repository.py` - Database operations (300+ lines)
4. ✅ `posts/DESIGN.md` - Complete design document

### Still Needed (Backend)
- [ ] `posts/service.py` - Business logic
- [ ] `posts/schema.py` - Pydantic schemas
- [ ] `posts/routes.py` - API endpoints

### Frontend (Next.js/React)
- [ ] Post composer component
- [ ] Post card component
- [ ] Feed component
- [ ] Media viewer
- [ ] Comments section

## 🎨 Frontend UI Design - Best Practices

### Post Card Design (Twitter/Instagram inspired)

```tsx
<PostCard>
  <Header>
    <Avatar /> + Name + Username + Time + Menu
  </Header>
  
  <Content>
    <Text /> (with hashtags, mentions highlighted)
  </Content>
  
  <Media>
    {/* Images: Grid layout (1, 2, 3, 4+ images) */}
    {/* Video: Player with controls */}
    {/* Link: Preview card */}
  </Media>
  
  <Actions>
    <Like /> <Comment /> <Repost /> <Share /> <Bookmark />
  </Actions>
  
  <Stats>
    {likes} likes · {comments} comments · {views} views
  </Stats>
</PostCard>
```

### Media Grid Layouts

**1 Image:** Full width
**2 Images:** Side by side (50/50)
**3 Images:** 1 large + 2 small
**4+ Images:** 2x2 grid with "+N more" overlay

### Color Scheme (Modern & Clean)

```css
Background: #0a0f14 (slate-950)
Cards: #0f1419 (slate-900/50) with blur
Text: #f1f5f9 (slate-50)
Muted: #94a3b8 (slate-400)
Accent: #10b981 (emerald-500)
Borders: rgba(148, 163, 184, 0.1)
```

### Animations

- Fade in posts on scroll
- Heart animation on like
- Smooth expand for images
- Skeleton loading for feed

## 📱 Component Structure

```
components/
├── posts/
│   ├── PostCard.tsx           - Main post display
│   ├── PostComposer.tsx       - Create new post
│   ├── PostActions.tsx        - Like, comment, etc.
│   ├── PostMedia.tsx          - Media display
│   ├── PostMediaGrid.tsx      - Image grid layouts
│   ├── VideoPlayer.tsx        - Video with controls
│   ├── LinkPreview.tsx        - Link card
│   ├── CommentsList.tsx       - Comments thread
│   └── PostMenu.tsx           - Edit/delete menu
└── feed/
    ├── FeedContainer.tsx      - Main feed
    ├── FeedSkeleton.tsx       - Loading state
    └── InfiniteScroll.tsx     - Pagination
```

## 🚀 Quick Start Implementation

### Step 1: Complete Backend

```bash
# Create remaining files
touch apps/api/app/modules/posts/service.py
touch apps/api/app/modules/posts/schema.py
touch apps/api/app/modules/posts/routes.py

# Add to router
# apps/api/app/router.py
from app.modules.posts.routes import router as posts_router
api_router.include_router(posts_router, tags=["posts"])
```

### Step 2: Frontend Components

```bash
# Create components
mkdir -p apps/web/src/components/posts
touch apps/web/src/components/posts/PostCard.tsx
touch apps/web/src/components/posts/PostComposer.tsx
touch apps/web/src/components/posts/PostActions.tsx
```

### Step 3: API Integration

```typescript
// lib/api/posts.ts
export const postsApi = {
  create: (data) => fetch('/api/v1/posts', {...}),
  getFeed: (page) => fetch('/api/v1/posts?page=' + page),
  like: (id) => fetch(`/api/v1/posts/${id}/like`, {method: 'POST'}),
  // ... etc
};
```

## 🎯 Priority Implementation Order

### Phase 1: Core (Week 1)
1. ✅ Database models
2. ✅ Repository layer
3. ⏳ Service layer
4. ⏳ API routes
5. ⏳ Basic PostCard component
6. ⏳ Feed display

### Phase 2: Interactions (Week 2)
7. Like/unlike functionality
8. Comments system
9. Repost functionality
10. Bookmarks

### Phase 3: Media (Week 3)
11. Image upload & display
12. Video player
13. Link preview
14. PDF viewer

### Phase 4: Polish (Week 4)
15. Animations
16. Infinite scroll
17. Real-time updates
18. Performance optimization

## 💡 Best UI/UX Practices

### 1. Optimistic Updates
```typescript
// Like immediately, rollback if fails
const handleLike = async () => {
  setLiked(true);
  setLikesCount(prev => prev + 1);
  
  try {
    await api.likePost(postId);
  } catch (error) {
    setLiked(false);
    setLikesCount(prev => prev - 1);
  }
};
```

### 2. Skeleton Loading
```tsx
{loading ? (
  <PostSkeleton count={3} />
) : (
  posts.map(post => <PostCard key={post.id} post={post} />)
)}
```

### 3. Image Lazy Loading
```tsx
<img 
  src={post.media[0].url}
  loading="lazy"
  className="w-full h-auto"
/>
```

### 4. Infinite Scroll
```tsx
<InfiniteScroll
  dataLength={posts.length}
  next={loadMore}
  hasMore={hasMore}
  loader={<Spinner />}
>
  {posts.map(post => <PostCard key={post.id} post={post} />)}
</InfiniteScroll>
```

### 5. Responsive Media Grid
```tsx
const getGridClass = (count: number) => {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-2 grid-rows-2";
  return "grid-cols-2 grid-rows-2";
};
```

## 🎨 Example PostCard Component

```tsx
export function PostCard({ post, currentUserId }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  return (
    <article className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar user={post.author} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">{post.author.full_name}</span>
            {post.author.is_verified && <VerifiedBadge />}
            <span className="text-slate-600">@{post.author.username}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-600">{formatTime(post.created_at)}</span>
          </div>
        </div>
        <PostMenu post={post} currentUserId={currentUserId} />
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <PostMediaGrid media={post.media} />
      )}

      {/* Link Preview */}
      {post.link_preview && (
        <LinkPreview preview={post.link_preview} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors"
        >
          {liked ? <HeartFilled /> : <HeartOutline />}
          <span className="text-sm">{likesCount}</span>
        </button>
        
        <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-500 transition-colors">
          <CommentIcon />
          <span className="text-sm">{post.comments_count}</span>
        </button>
        
        <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors">
          <RepostIcon />
          <span className="text-sm">{post.reposts_count}</span>
        </button>
        
        <button className="ml-auto text-slate-400 hover:text-emerald-500 transition-colors">
          <BookmarkIcon />
        </button>
      </div>

      {/* Stats */}
      <div className="mt-3 text-xs text-slate-600">
        {post.views_count.toLocaleString()} views
      </div>
    </article>
  );
}
```

## 🚀 Next Steps

Want me to implement:
1. **Complete backend** (service + routes)?
2. **Frontend components** (PostCard, Composer, Feed)?
3. **Both together**?

Let me know and I'll create production-ready code! 🎨
