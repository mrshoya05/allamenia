from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    APP_NAME: str = "Allamenia"
    DEBUG: bool = False
    BACKEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()