import json
from openai import OpenAI
from core.config import settings

# Inicjalizacja klienta tylko raz na podstawie pliku config
client = OpenAI(api_key=settings.PCSS_API_KEY, base_url=settings.PCSS_BASE_URL)

def sanitize_json_response(raw_content: str) -> str:
    """Czyści odpowiedź modelu z niepotrzebnych znaków markdown i tekstu."""
    if raw_content.startswith("```json\n"):
        raw_content = raw_content[8:]
    elif raw_content.startswith("```json"):
        raw_content = raw_content[7:]
        
    if raw_content.startswith("```\n"):
        raw_content = raw_content[4:]
    elif raw_content.startswith("```"):
        raw_content = raw_content[3:]
        
    if raw_content.endswith("```"):
        raw_content = raw_content[:-3]
        
    raw_content = raw_content.strip()
    
    start_idx = raw_content.find('[')
    end_idx = raw_content.rfind(']')
    
    if start_idx != -1 and end_idx != -1:
        return raw_content[start_idx:end_idx+1]
        
    return raw_content


def generate_quiz_from_text(text: str, num_questions: int, difficulty: str) -> list:
    """Wysyła tekst do modelu Bielik i zwraca strukturę JSON."""
    prompt = f"""Jesteś nauczycielem. Wygeneruj {num_questions} pytań quizowych na poziomie trudności: {difficulty}.
    MUSISZ bazować WYŁĄCZNIE na poniższym tekście z notatek studenta. Nie wymyślaj informacji spoza tekstu.
    
    TEKST Z NOTATEK:
    {text}
    
    Zwróć wynik WYŁĄCZNIE jako tablicę obiektów JSON. Każdy obiekt ma mieć pola: 
    "id" (liczba), "question" (tekst), "options" (tablica 4 stringów), "correctAnswer" (indeks od 0 do 3).
    Zwróć sam czysty JSON. Żadnego tekstu przed, żadnego tekstu po, żadnych znaczników markdown."""

    try:
        response = client.chat.completions.create(
            model=settings.PCSS_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2500,
            temperature=0.3
        )
        
        raw_content = response.choices[0].message.content.strip()
        clean_json = sanitize_json_response(raw_content)

        return json.loads(clean_json)
        
    except json.JSONDecodeError:
        raise Exception("Błąd modelu: nie zwrócił poprawnego JSONa. Spróbuj ponownie.")
    except Exception as e:
        raise Exception(f"Wystąpił błąd komunikacji: {str(e)}")
    