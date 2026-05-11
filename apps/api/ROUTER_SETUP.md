# Router Setup - Verification Guide

## ✅ Current Structure

### 1. Main Application (`app/main.py`)
```python
from app.router import api_router  # ✅ Centralized router

app.include_router(api_router, prefix="/api/v1")
```

### 2. Central Router (`app/router.py`)
```python
from fastapi import APIRouter
from app.modules.users.routes import router as user_router
from app.modules.follows.routes import router as follow_router

api_router = APIRouter()
api_router.include_router(user_router, tags=["users"])
api_router.include_router(follow_router, tags=["follows"])
```

### 3. Module Routers

**Users Router** (`app/modules/users/routes.py`):
```python
router = APIRouter(prefix="/users", tags=["users"])

@router.post("/signup")
@router.post("/login")
@router.get("/me")
# ... etc
```

**Follows Router** (`app/modules/follows/routes.py`):
```python
router = APIRouter(prefix="/follows", tags=["follows"])

@router.post("/{user_id}")           # Follow user
@router.delete("/{user_id}")         # Unfollow user
@router.get("/status/{user_id}")     # Check status
# ... etc
```

## 🔗 Final URL Structure

All routes are prefixed with `/api/v1`:

### User Routes
- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- etc.

### Follow Routes
- `POST /api/v1/follows/{user_id}` - Follow user
- `DELETE /api/v1/follows/{user_id}` - Unfollow user
- `GET /api/v1/follows/status/{user_id}` - Check follow status
- `GET /api/v1/follows/{user_id}/followers` - Get followers
- `GET /api/v1/follows/{user_id}/following` - Get following
- `GET /api/v1/follows/requests/pending` - Get pending requests
- `POST /api/v1/follows/requests/{id}/accept` - Accept request
- `POST /api/v1/follows/requests/{id}/reject` - Reject request
- `GET /api/v1/follows/{user_id}/stats` - Get stats

## ✅ Verification Checklist

- [x] `main.py` imports `api_router` from `router.py`
- [x] `router.py` imports all module routers
- [x] `router.py` includes all routers in `api_router`
- [x] `main.py` includes `api_router` with `/api/v1` prefix
- [x] All module routers have proper prefixes
- [x] All routes have proper tags for documentation

## 🧪 Testing

### 1. Check API Docs
Visit: `http://localhost:8000/docs`

You should see:
- **users** section with all user endpoints
- **follows** section with all follow endpoints

### 2. Test Follow Endpoint
```bash
# Follow a user
curl -X POST "http://localhost:8000/api/v1/follows/{user_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get followers
curl "http://localhost:8000/api/v1/follows/{user_id}/followers?page=1&limit=20"
```

### 3. Check Server Logs
When server starts, you should see:
```
INFO:     Allamenia API started 🚀
INFO:     Application startup complete.
```

No import errors should appear.

## 🎯 Benefits of This Structure

1. **Centralized**: All routers in one place (`router.py`)
2. **Scalable**: Easy to add new modules
3. **Clean**: `main.py` stays minimal
4. **Organized**: Each module has its own router
5. **Documented**: Auto-generated docs with proper tags

## 🚀 Adding New Modules

To add a new module (e.g., posts):

1. Create `app/modules/posts/routes.py`:
```python
router = APIRouter(prefix="/posts", tags=["posts"])
```

2. Add to `app/router.py`:
```python
from app.modules.posts.routes import router as posts_router
api_router.include_router(posts_router, tags=["posts"])
```

That's it! No need to touch `main.py`.

## ⚠️ Common Issues

### Issue: Routes not showing in docs
**Solution**: Check that router is included in `router.py`

### Issue: 404 on endpoints
**Solution**: Verify prefix in both module router and main app

### Issue: Import errors
**Solution**: Check all imports in `router.py` and module routes

## ✅ Current Status

All routers are properly configured and ready to use! 🎉
