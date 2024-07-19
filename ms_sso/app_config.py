# app_config.py
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
AUTHORITY = os.getenv("AUTHORITY")
REDIRECT_PATH = "/getAToken"
SCOPE = ["User.ReadBasic.All", "Calendars.ReadWrite"]
ENDPOINT = 'https://graph.microsoft.com/v1.0/me/events'
SESSION_TYPE = "redis"
SESSION_REDIS = os.getenv("SESSION_REDIS") or "redis://localhost:6379/0"
