from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import quiz

app = FastAPI(title="EduScanner API")

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Podłączamy wszystkie routingi dotyczące quizów z prefixem /api
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])
