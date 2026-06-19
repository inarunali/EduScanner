import json
import random
from openai import OpenAI
from core.config import settings

client = OpenAI(api_key=settings.PCSS_API_KEY, base_url=settings.PCSS_BASE_URL)


def sanitize_json_response(raw_content: str) -> str:
    """Strictly extracts only the JSON array from the LLM response."""
    raw_content = raw_content.strip()
    start_idx = raw_content.find('[')
    end_idx = raw_content.rfind(']')
    if start_idx != -1 and end_idx != -1:
        return raw_content[start_idx:end_idx + 1]
    return raw_content


def shuffle_quiz_options(quiz_data: list) -> list:
    """Shuffles the answer options safely."""
    for question in quiz_data:
        if not isinstance(question, dict):
            continue

        q_type = str(question.get("type", "")).lower().replace("-", "_")
        if q_type == "true_false":
            continue

        original_options = question.get("options", [])
        original_correct = question.get("correctAnswers", [])

        if not isinstance(original_options, list) or len(original_options) == 0:
            continue

        if not isinstance(original_correct, list):
            original_correct = []

        paired = [(opt, i in original_correct) for i, opt in enumerate(original_options)]
        random.shuffle(paired)

        question["options"] = [str(opt) for opt, _ in paired]
        question["correctAnswers"] = [idx for idx, (_, is_corr) in enumerate(paired) if is_corr]

    return quiz_data


def generate_quiz_from_images(base64_images: list, num_questions: int, difficulty: str, question_type: str,
                              nlp_keywords: list = None, semantic_context: list = None) -> list:
    """Sends images and NLP context to the Qwen-VL model to return a high-quality quiz."""

    keywords_prompt = ""
    if nlp_keywords:
        keywords_str = ", ".join(nlp_keywords)
        keywords_prompt = f"\nPAY SPECIAL ATTENTION to these concepts (must be included in the questions): {keywords_str}."

    context_prompt = ""
    if semantic_context:
        context_str = "\n".join([f"- {s}" for s in semantic_context])
        context_prompt = f"\nUse the following sentences as the main factual context:\n{context_str}\n"

    prompt_text = f"""Jesteś egzaminatorem akademickim. Wygeneruj dokładnie {num_questions} pytań na podstawie ZAŁĄCZONYCH ZDJĘĆ oraz tekstu.
        POZIOM TRUDNOŚCI - {difficulty.upper()}.
        TYP PYTAŃ - {question_type.upper()} (single - 1 odpowiedź, multiple - kilka, true_false - Prawda/Fałsz).
        {keywords_prompt}
        {context_prompt}

        ZASADA SEMANTIC SIMILARITY: 
        Błędne opcje odpowiedzi (dystraktory) muszą być semantycznie zbliżone do poprawnej odpowiedzi, ale być merytorycznie błędne. Nie używaj absurdalnych fałszów.

        WAŻNE ZASADY FORMATOWANIA JSON:
        1. Pole "options" JEST OBOWIĄZKOWE dla każdego typu pytania (nawet dla true_false podaj ["Prawda", "Fałsz"]).
        2. NIE dodawaj prefiksów "A.", "B.", "C.", "D." wewnątrz tekstów opcji! Zwracaj sam czysty tekst odpowiedzi.

        Zwróć wynik WYŁĄCZNIE jako tablicę obiektów JSON o następującej strukturze:
        [{{ 
            "id": 1, 
            "type": "single", 
            "question": "Treść pytania?", 
            "options": ["Opcja 1", "Opcja 2", "Opcja 3", "Opcja 4"], 
            "correctAnswers": [0],
            "explanation": "Krótkie wyjaśnienie dlaczego ta odpowiedź jest poprawna."
        }}]
        Żadnego tekstu poza JSONem!"""


    message_content = [{"type": "text", "text": prompt_text}]

    for img in base64_images:
        message_content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})

    try:
        response = client.chat.completions.create(
            model="Qwen3-VL-235B-A22B-Instruct-FP8",
            messages=[{"role": "user", "content": message_content}],
            max_tokens=3000,
            temperature=0.3
        )
        raw_content = response.choices[0].message.content.strip()
        print(f"\n--- MODEL RESPONSE ---\n{raw_content}\n----------------------")

        clean_json = sanitize_json_response(raw_content)
        return shuffle_quiz_options(json.loads(clean_json))
    except Exception as e:
        print(f"\n--- LLM ERROR ---\n{str(e)}\n-----------------")
        raise Exception(f"LLM Error: {str(e)}")