import json
from openai import OpenAI
from core.config import settings
import random

# client initialization
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


def generate_quiz_from_text(text: str, num_questions: int, difficulty: str, question_type: str) -> list:
    """Wysyła tekst do modelu Bielik i zwraca strukturę JSON."""
    
    # question type instructions
    if question_type == "mixed":
        type_instruction = "Wygeneruj MIESZANKĘ różnych typów pytań (użyj losowo: 'single' (jednokrotny wybór - tylko 1 poprawna odpowiedź), 'multiple' (wielokrotny wybór - OBOWIĄZKOWO więcej niż 1 poprawnych odpowiedzi), 'true_false' prawda/fałsz - zawsze dokładnie 2 opcje: ['Prawda', 'Fałsz']. Jeśli pytań jest więcej, niż 2, to chociaż jedno pytanie MUSI miec odpowiedź 'Fałsz'))."
    elif question_type == "single":
        type_instruction = "ABSOLUTNY NAKAZ: WSZYSTKIE pytania MUSZĄ być typu 'single' (jednokrotny wybór - tylko 1 poprawna odpowiedź)."
    elif question_type == "multiple":
        type_instruction = "ABSOLUTNY NAKAZ: WSZYSTKIE pytania MUSZĄ być typu 'multiple' (wielokrotny wybór - OBOWIĄZKOWO 2 lub więcej poprawnych odpowiedzi)."
    elif question_type == "true_false":
        type_instruction = "ABSOLUTNY NAKAZ: WSZYSTKIE pytania MUSZĄ być typu 'true_false' (prawda/fałsz - zawsze dokładnie 2 opcje: ['Prawda', 'Fałsz']. Jeśli pytań jest więcej, niż 2, to chociaż jedno pytanie MUSI miec odpowiedź 'Fałsz')"
    else:
        type_instruction = "Wygeneruj pytania mieszane."

    # difficulty level instructions
    if difficulty == "easy":
        diff_instruction = "Poziom ŁATWY: Pytaj o najbardziej podstawowe definicje i oczywiste fakty wprost z tekstu. Błędne odpowiedzi (dystraktory) mają być bardzo łatwe do odrzucenia na pierwszy rzut oka."
    elif difficulty == "academic":
        diff_instruction = "Poziom AKADEMICKI (BARDZO TRUDNY): Pytaj o ukryte niuanse, daty, wnioski i powiązania między faktami. Błędne odpowiedzi (dystraktory) muszą być niesamowicie podchwytliwe, wiarygodne i wymagać od studenta głębokiego zrozumienia tematu."
    else:
        diff_instruction = "Poziom ŚREDNI: Pytaj o główne koncepcje i ważne szczegóły. Błędne odpowiedzi powinny być sensowne, ale wyraźnie błędne dla kogoś, kto przeczytał notatki."

    # main prompt
    prompt = f"""Jesteś egzaminatorem akademickim. Wygeneruj dokładnie {num_questions} pytań quizowych z poniższych notatek.
    
    POZIOM TRUDNOŚCI - {diff_instruction}
    
    TYP PYTAŃ - {type_instruction}

    MUSISZ bazować WYŁĄCZNIE na tekście z notatek studenta:
    {text}

    Zwróć wynik WYŁĄCZNIE jako tablicę obiektów JSON. Każdy obiekt ma mieć pola: 
    "id" (liczba), 
    "type" (tekst - zgodny z instrukcją wyżej), 
    "question" (tekst pytania), 
    "options" (tablica stringów: dla 'true_false' to ZAWSZE ["Prawda", "Fałsz"], dla reszty 4 opcje), 
    "correctAnswers" (tablica liczb: indeksy poprawnych odpowiedzi od 0. Dla 'multiple' podaj wszystkie poprawne indeksy np. [0, 2], dla reszty typów podaj dokładnie JEDNĄ cyfrę w tablicy np. [2]).
    
    Zwróć sam czysty JSON. Żadnych znaczników markdown i żadnego innego tekstu."""

    try:
        response = client.chat.completions.create(
            model=settings.PCSS_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.3,
            presence_penalty=0.5
        )
        
        raw_content = response.choices[0].message.content.strip()
        
        print("\n" + "="*50)
        print(f"🧠 BIELIK WYZWANIE: {difficulty.upper()} | TYP: {question_type.upper()}")
        print(raw_content)
        print("="*50 + "\n")
        
        clean_json = sanitize_json_response(raw_content)
        quiz_data = json.loads(clean_json)
        shuffled_quiz_data = shuffle_quiz_options(quiz_data)
        
        return shuffled_quiz_data
        
    except json.JSONDecodeError:
        raise Exception("Błąd modelu: nie zwrócił poprawnego JSONa. Spróbuj ponownie.")
    except Exception as e:
        raise Exception(f"Wystąpił błąd komunikacji: {str(e)}")
    
def shuffle_quiz_options(quiz_data: list) -> list:
    """Mixes questions order"""
    for question in quiz_data:
        if question.get("type") == "true_false":
            continue
            
        original_options = question.get("options", [])
        original_correct = question.get("correctAnswers", [])
        
        paired_options = [
            (opt, i in original_correct) 
            for i, opt in enumerate(original_options)
        ]

        random.shuffle(paired_options)

        new_options = []
        new_correct = []
        for new_index, (opt_text, is_correct) in enumerate(paired_options):
            new_options.append(opt_text)
            if is_correct:
                new_correct.append(new_index)

        question["options"] = new_options
        question["correctAnswers"] = new_correct
        
    return quiz_data
    