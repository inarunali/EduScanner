import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

# Ładowanie konfiguracji
load_dotenv()

app = FastAPI()

# Zezwolenie na zapytania z frontendu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicjalizacja klienta Bielik
api_key = os.getenv("PCSS_API_KEY")
base_url = os.getenv("PCSS_BASE_URL", "https://llm.hpc.psnc.pl/v1")
model_name = os.getenv("PCSS_MODEL", "bielik_11b")
client = OpenAI(api_key=api_key, base_url=base_url)

class QuizRequest(BaseModel):
    numQuestions: int
    difficulty: str

@app.post("/api/generate")
def generate_quiz(req: QuizRequest):
    prompt = f"""Jesteś nauczycielem. Wygeneruj {req.numQuestions} pytań quizowych z wiedzy ogólnej na poziomie trudności: {req.difficulty}.
    Zwróć wynik WYŁĄCZNIE jako tablicę obiektów JSON. Każdy obiekt ma mieć pola: 
    "id" (liczba), "question" (tekst), "options" (tablica 4 stringów), "correctAnswer" (indeks od 0 do 3).
    Zwróć sam czysty JSON. Żadnego tekstu przed, żadnego tekstu po, żadnych znaczników markdown."""

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7
        )
        
        # Pobieramy surowy tekst od modelu
        raw_content = response.choices[0].message.content.strip()
        
        # CZYSZCZENIE (Sanitization):
        # 1. Usuwamy ewentualne formatowanie markdown
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]
        if raw_content.startswith("```"):
            raw_content = raw_content[3:]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]
            
        raw_content = raw_content.strip()
        
        # 2. Wyciągamy tylko to, co jest między '[' a ']'
        start_idx = raw_content.find('[')
        end_idx = raw_content.rfind(']')
        
        if start_idx != -1 and end_idx != -1:
            clean_json = raw_content[start_idx:end_idx+1]
        else:
            clean_json = raw_content

        # Próbujemy zamienić oczyszczony tekst na obiekt w Pythonie
        return {"quiz": json.loads(clean_json)}
        
    except json.JSONDecodeError as e:
        # Jeśli znowu się zepsuje, wypiszemy dokładnie co zwrócił model, żeby to przeanalizować!
        print("\n=== BŁĄD PARSOWANIA JSON ===")
        print("Model Bielik zwrócił taki tekst, którego nie udało się oczyścić:")
        print(raw_content)
        print("==============================\n")
        raise HTTPException(status_code=500, detail="Model wygenerował tekst, którego nie udało się zamienić na JSON. Spróbuj ponownie kliknąć Generuj.")
        
    except Exception as e:
        print(f"Wystąpił inny błąd: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    