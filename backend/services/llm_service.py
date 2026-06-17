import json
import random
import re
from openai import OpenAI
from core.config import settings

client = OpenAI(api_key=settings.PCSS_API_KEY, base_url=settings.PCSS_BASE_URL)

def sanitize_json_response(raw_content: str) -> str:
    raw_content = raw_content.strip()

    start_idx = raw_content.find('[')
    end_idx = raw_content.rfind(']')

    if start_idx != -1 and end_idx != -1:
        return raw_content[start_idx:end_idx + 1]

    return raw_content

def shuffle_quiz_options(quiz_data: list) -> list:
    for question in quiz_data:
        if question.get("type") == "true_false":
            continue

        original_options = question.get("options", [])
        original_correct = question.get("correctAnswers", [])

        paired = [(opt, i in original_correct) for i, opt in enumerate(original_options)]
        random.shuffle(paired)

        question["options"] = [opt for opt, _ in paired]
        question["correctAnswers"] = [idx for idx, (_, is_corr) in enumerate(paired) if is_corr]

    return quiz_data


def generate_quiz_from_images(base64_images: list, num_questions: int, difficulty: str, question_type: str) -> list:

    prompt_text = f"""Jesteś egzaminatorem akademickim. Wygeneruj dokładnie {num_questions} pytań na podstawie ZAŁĄCZONYCH ZDJĘĆ.
        POZIOM TRUDNOŚCI - {difficulty.upper()}.
        TYP PYTAŃ - {question_type.upper()} (single - 1 odpowiedź, multiple - kilka, true_false - Prawda/Fałsz).

        Zwróć wynik WYŁĄCZNIE jako tablicę obiektów JSON:
        [{{ "id": 1, "type": "single", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswers": [0] }}]
        Żadnego tekstu poza JSONem!"""

    message_content = [{"type": "text", "text": prompt_text}]

    for img in base64_images:
        message_content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})

    try:
        response = client.chat.completions.create(
            model="Qwen3-VL-235B-A22B-Instruct-FP8",
            messages=[{"role": "user", "content": message_content}],
            max_tokens=2500,
            temperature=0.3
        )
        raw_content = response.choices[0].message.content.strip()

        print(f"\n--- ODPOWIEDŹ MODELI ---\n{raw_content}\n--------------------")

        clean_json = sanitize_json_response(raw_content)
        return shuffle_quiz_options(json.loads(clean_json))

    except Exception as e:
        raise Exception(f"Błąd LLM: {str(e)}")