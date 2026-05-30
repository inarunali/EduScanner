import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PCSS_API_KEY = os.getenv("PCSS_API_KEY")
    PCSS_BASE_URL = os.getenv("PCSS_BASE_URL", "https://llm.hpc.psnc.pl/v1")
    PCSS_MODEL = os.getenv("PCSS_MODEL", "bielik_11b")

settings = Settings()
