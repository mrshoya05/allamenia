# Allamenia API - Industry-Grade Social Media Backend

FastAPI + MongoDB social media backend with complete user management.

## Features

### Authentication & Security
- JWT access + refresh tokens
- Bcrypt password hashing with SHA256 pre-hash
- Protected routes with Bearer token auth
- Token refresh mechanism

### User Management
- Signup/Login with email validation
- Profile CRUD (update, soft delete, hard delete)
- Password change
- User search
- Public/Private accounts
- Verified badges

### Social Features
- Follow/Unfollow users
- Block/Unblock users
- Followers/Following lists
- Follower/Following counts (denormalized)
- Private account support

### AI-Ready
- `ai_interests` field for personalization
- `ai_embedding` field for vector-based recommendations
- Ready for posts/comments/likes integration

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run
uvicorn app.main:app --reload
```

## API Endpoints

### Auth
- `POST /api/v1/users/signup` - Register
- `POST /api/v1/users/login` - Login (returns access + refresh tokens)
- `POST /api/v1/users/refresh` - Refresh access token

### Profile
- `GET /api/v1/users/me` - Get own profile
- `PUT /api/v1/users/me` - Update profile
- `PUT /api/v1/users/me/password` - Change password
- `DELETE /api/v1/users/me` - Soft delete (deactivate)
- `DELETE /api/v1/users/me/hard` - Hard delete (permanent)
- `GET /api/v1/users/{username}` - Get user profile
- `GET /api/v1/users/search?q=query` - Search users

### Social
- `POST /api/v1/users/{username}/follow` - Follow user
- `DELETE /api/v1/users/{username}/follow` - Unfollow user
- `POST /api/v1/users/{username}/block` - Block user
- `DELETE /api/v1/users/{username}/block` - Unblock user
- `GET /api/v1/users/{username}/followers` - Get followers
- `GET /api/v1/users/{username}/following` - Get following

## Architecture

```
Route → Service → Repository → Database
```

- **Routes**: HTTP endpoints, validation
- **Service**: Business logic, error handling
- **Repository**: Database queries only
- **Model**: Schema documentation

## User Model

```python
{
    "username": str,           # unique, lowercase
    "email": str,              # unique, lowercase
    "password": str,           # bcrypt hashed
    "full_name": str,
    "bio": str,
    "avatar_url": str,
    "cover_url": str,
    "website": str,
    "location": str,
    "date_of_birth": datetime,
    "role": str,               # user | admin | moderator
    
    # Social graph
    "followers": [user_ids],
    "following": [user_ids],
    "blocked_users": [user_ids],
    
    # Counts
    "followers_count": int,
    "following_count": int,
    "posts_count": int,
    
    # Status
    "is_verified": bool,
    "is_private": bool,
    "is_banned": bool,
    "is_deleted": bool,
    "deleted_at": datetime,
    
    # AI
    "ai_interests": [str],
    "ai_embedding": [float],
    
    # Meta
    "last_seen": datetime,
    "created_at": datetime,
    "updated_at": datetime,
}
```

## Security Features

- Password hashing: SHA256 → Bcrypt (handles long passwords)
- JWT tokens with expiry
- Soft delete (frees email/username for reuse)
- Blocked user checks
- Private account visibility control
- MongoDB indexes on email/username

## Next Steps

Ready to add:
- Posts module (create, update, delete, feed)
- Comments module
- Likes module
- Chat/DM module
- AI features (recommendations, content moderation)
- File uploads (S3/Cloudinary)
- Notifications
- Rate limiting
- Admin panel

## Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `DEBUG=False`
- [ ] Configure specific CORS origins
- [ ] Add rate limiting (slowapi)
- [ ] Set up logging to file/service
- [ ] Add monitoring (Sentry)
- [ ] Use environment-specific configs
- [ ] Set up CI/CD
- [ ] Add tests
