# Posts System - Complete Design Document

## 🎯 Overview

Scalable social media posts system supporting:
- ✅ Text posts (up to 5000 chars)
- ✅ Images (multiple)
- ✅ Videos (30 sec max)
- ✅ Audio files
- ✅ PDFs
- ✅ Link previews
- ✅ Likes, comments, reposts
- ✅ Views tracking
- ✅ Bookmarks

## 📊 Database Design

### Collections

#### 1. `posts` Collection
```javascript
{
  _id: ObjectId,
  author_id: "user123",
  content: "Post text content...",
  media: [
    {
      type: "image|video|audio|pdf",
      url: "https://cdn.../file.jpg",
      thumbnail_url: "https://cdn.../thumb.jpg",  // For videos
      duration: 25,  // seconds (video/audio)
      size: 1024000,  // bytes
      mime_type: "image/jpeg",
      width: 1920,
      height: 1080
    }
  ],
  link_preview: {
    url: "https://example.com",
    title: "Page Title",
    description: "Description...",
    image: "https://example.com/og-image.jpg",
    domain: "example.com"
  },
  // Denormalized counts (fast reads)
  likes_count: 1250,
  comments_count: 45,
  reposts_count: 30,
  views_count: 5000,
  // Repost info
  is_repost: false,
  original_post_id: null,
  // Reply info
  reply_to_post_id: null,
  reply_to_user_id: null,
  // Privacy
  visibility: "public|followers|private",
  is_pinned: false,
  is_deleted: false,
  is_edited: false,
  edited_at: null,
  created_at: ISODate("2024-01-01T00:00:00Z"),
  updated_at: ISODate("2024-01-01T00:00:00Z")
}
```

**Indexes:**
```javascript
// Feed queries
{ author_id: 1, created_at: -1 }

// User posts
{ author_id: 1, is_deleted: 1, created_at: -1 }

// Replies
{ reply_to_post_id: 1, created_at: 1 }

// Reposts
{ original_post_id: 1, created_at: -1 }

// Search
{ content: "text" }

// Trending
{ created_at: -1, likes_count: -1 }
```

#### 2. `likes` Collection (Separate for scalability)
```javascript
{
  _id: ObjectId,
  user_id: "user123",
  post_id: "post456",
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

**Indexes:**
```javascript
// Get likes for a post
{ post_id: 1, created_at: -1 }

// Get user's likes
{ user_id: 1, created_at: -1 }

// Unique constraint
{ user_id: 1, post_id: 1 } (unique)
```

#### 3. `bookmarks` Collection
```javascript
{
  _id: ObjectId,
  user_id: "user123",
  post_id: "post456",
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

#### 4. `views` Collection (Analytics)
```javascript
{
  _id: ObjectId,
  user_id: "user123",  // null for anonymous
  post_id: "post456",
  ip_address: "192.168.1.1",
  created_at: ISODate("2024-01-01T00:00:00Z")
}
```

## 🚀 API Endpoints

### Posts

```
POST   /api/v1/posts                    - Create post
GET    /api/v1/posts                    - Get feed (following + recommended)
GET    /api/v1/posts/trending           - Trending posts
GET    /api/v1/posts/{post_id}          - Get single post
PUT    /api/v1/posts/{post_id}          - Edit post
DELETE /api/v1/posts/{post_id}          - Delete post
GET    /api/v1/posts/{post_id}/replies  - Get replies/comments
```

### Interactions

```
POST   /api/v1/posts/{post_id}/like     - Like post
DELETE /api/v1/posts/{post_id}/like     - Unlike post
GET    /api/v1/posts/{post_id}/likes    - Get users who liked
POST   /api/v1/posts/{post_id}/repost   - Repost
DELETE /api/v1/posts/{post_id}/repost   - Unrepost
POST   /api/v1/posts/{post_id}/bookmark - Bookmark
DELETE /api/v1/posts/{post_id}/bookmark - Remove bookmark
GET    /api/v1/posts/bookmarks          - Get bookmarked posts
POST   /api/v1/posts/{post_id}/view     - Track view
```

### User Posts

```
GET /api/v1/users/{username}/posts      - Get user's posts
GET /api/v1/users/{username}/media      - Get user's media posts
GET /api/v1/users/{username}/likes      - Get user's liked posts
```

## 📝 Request/Response Examples

### Create Post

**Request:**
```json
POST /api/v1/posts
{
  "content": "Check out this amazing sunset! 🌅",
  "media": [
    {
      "type": "image",
      "url": "https://cdn.example.com/sunset.jpg",
      "width": 1920,
      "height": 1080,
      "size": 245000,
      "mime_type": "image/jpeg"
    }
  ],
  "visibility": "public"
}
```

**Response:**
```json
{
  "id": "post123",
  "author": {
    "id": "user456",
    "username": "john_doe",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "is_verified": true
  },
  "content": "Check out this amazing sunset! 🌅",
  "media": [...],
  "likes_count": 0,
  "comments_count": 0,
  "reposts_count": 0,
  "views_count": 0,
  "is_liked": false,
  "is_bookmarked": false,
  "is_reposted": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Create Post with Video

**Request:**
```json
POST /api/v1/posts
{
  "content": "My latest vlog! 🎥",
  "media": [
    {
      "type": "video",
      "url": "https://cdn.example.com/vlog.mp4",
      "thumbnail_url": "https://cdn.example.com/vlog-thumb.jpg",
      "duration": 28,
      "width": 1920,
      "height": 1080,
      "size": 15000000,
      "mime_type": "video/mp4"
    }
  ]
}
```

### Create Post with Link Preview

**Request:**
```json
POST /api/v1/posts
{
  "content": "Great article about AI!",
  "link_preview": {
    "url": "https://example.com/article",
    "title": "The Future of AI",
    "description": "An in-depth look at...",
    "image": "https://example.com/og-image.jpg",
    "domain": "example.com"
  }
}
```

### Get Feed

**Request:**
```
GET /api/v1/posts?page=1&limit=20
```

**Response:**
```json
{
  "posts": [
    {
      "id": "post123",
      "author": {...},
      "content": "...",
      "media": [...],
      "likes_count": 150,
      "comments_count": 25,
      "is_liked": true,
      "created_at": "..."
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 500,
  "has_more": true
}
```

## 🎨 Media Handling

### Supported Formats

**Images:**
- JPEG, PNG, GIF, WebP
- Max size: 10MB per image
- Max: 10 images per post

**Videos:**
- MP4, WebM, MOV
- Max duration: 30 seconds
- Max size: 100MB
- Auto-generate thumbnail

**Audio:**
- MP3, WAV, OGG
- Max duration: 30 seconds
- Max size: 50MB

**PDFs:**
- Max size: 50MB
- Generate preview thumbnail

### Upload Flow

1. **Client uploads to CDN** (S3, Cloudinary, etc.)
2. **Get URL from CDN**
3. **Create post with media URLs**

```javascript
// Example: Upload to Cloudinary
const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset');
  
  const res = await fetch('https://api.cloudinary.com/v1_1/your_cloud/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await res.json();
  return {
    type: file.type.startsWith('image') ? 'image' : 'video',
    url: data.secure_url,
    width: data.width,
    height: data.height,
    size: data.bytes,
    mime_type: file.type
  };
};
```

## ⚡ Performance Optimizations

### 1. Denormalized Counts
- Store counts in post document
- Update via atomic operations
- Fast reads, slightly slower writes

### 2. Separate Collections
- Likes in separate collection
- Can handle millions of likes per post
- Efficient pagination

### 3. Indexes
- Compound indexes for common queries
- Text index for search
- Covered queries where possible

### 4. Caching Strategy
```
Feed: Cache 5 minutes
Trending: Cache 15 minutes
User posts: Cache 2 minutes
Post details: Cache 1 minute
```

### 5. Pagination
```javascript
// Cursor-based pagination for infinite scroll
GET /api/v1/posts?cursor=post123&limit=20

// Response includes next cursor
{
  "posts": [...],
  "next_cursor": "post456",
  "has_more": true
}
```

## 🔒 Privacy & Visibility

### Visibility Levels

**public**: Everyone can see
**followers**: Only followers can see
**private**: Only mentioned users

### Access Control

```python
def can_view_post(post, viewer_id):
    # Own post
    if post.author_id == viewer_id:
        return True
    
    # Public post
    if post.visibility == "public":
        return True
    
    # Followers only
    if post.visibility == "followers":
        return is_following(viewer_id, post.author_id)
    
    # Private
    return False
```

## 📊 Analytics

### Track Metrics

- **Views**: Unique views per post
- **Engagement Rate**: (likes + comments + reposts) / views
- **Reach**: Unique users who saw the post
- **Click-through**: Link clicks

### Trending Algorithm

```python
score = (
    likes_count * 1.0 +
    comments_count * 2.0 +
    reposts_count * 3.0
) / age_in_hours ** 1.5
```

## 🚀 Scalability

### Sharding Strategy

**By User ID:**
- Shard posts by author_id
- Co-locate user's posts

**By Time:**
- Shard by created_at
- Archive old posts

### Read Replicas

- Feed reads from replicas
- Writes to primary
- Eventual consistency OK for feeds

## 🔄 Real-time Updates

### WebSocket Events

```javascript
// New post in feed
{
  "type": "new_post",
  "post": {...}
}

// Post liked
{
  "type": "post_liked",
  "post_id": "post123",
  "likes_count": 151
}

// New comment
{
  "type": "new_comment",
  "post_id": "post123",
  "comment": {...}
}
```

## 📱 Frontend Integration

```typescript
// Create post
const createPost = async (data: CreatePostData) => {
  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await res.json();
};

// Like post
const likePost = async (postId: string) => {
  await fetch(`${API}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// Infinite scroll feed
const loadFeed = async (cursor?: string) => {
  const url = cursor 
    ? `${API}/posts?cursor=${cursor}&limit=20`
    : `${API}/posts?limit=20`;
  const res = await fetch(url);
  return await res.json();
};
```

## ✅ Implementation Checklist

- [ ] Create posts module structure
- [ ] Implement repository layer
- [ ] Implement service layer
- [ ] Create API routes
- [ ] Add media upload support
- [ ] Implement likes system
- [ ] Implement comments system
- [ ] Implement reposts
- [ ] Add bookmarks
- [ ] Add views tracking
- [ ] Implement feed algorithm
- [ ] Add trending posts
- [ ] Add search functionality
- [ ] Implement real-time updates
- [ ] Add caching layer
- [ ] Write tests
- [ ] Add rate limiting
- [ ] Deploy CDN for media

This design is production-ready and can scale to millions of posts! 🚀
