from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=60)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v):
        if not v.replace("_", "").replace(".", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, _ and .")
        return v.lower()

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v):
        return v.lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, v):
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ─── Profile Update Schema ────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=60)
    bio: Optional[str] = Field(default=None, max_length=160)
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = Field(default=None, max_length=60)
    date_of_birth: Optional[datetime] = None
    is_private: Optional[bool] = None
    ai_interests: Optional[List[str]] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


# ─── Response Schemas ─────────────────────────────────────────────────────────

class UserPublicResponse(BaseModel):
    id: str
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    cover_url: Optional[str]
    website: Optional[str]
    location: Optional[str]
    is_verified: bool
    is_private: bool
    followers_count: int
    following_count: int
    posts_count: int
    created_at: datetime


class UserPrivateResponse(UserPublicResponse):
    email: str
    role: str
    ai_interests: Optional[List[str]]
    last_seen: Optional[datetime]
