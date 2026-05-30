# backend/routers/quiz.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from services.pdf_service import extract_text_from_pdf
from services.llm_service import generate_quiz_from_text

router = APIRouter()

@router.post("/generate")
async def generate_quiz_endpoint(
    file: UploadFile = File(...),
    numQuestions: int = Form(...),
    difficulty: str = Form(...),
    questionType: str = Form(...) # <--- NOWY PARAMETR
):
    try:
        pdf_bytes = await file.read()
        extracted_text = await extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        # Przekazujemy typ pytania do logiki LLM
        quiz_data = generate_quiz_from_text(extracted_text, numQuestions, difficulty, questionType)
        return {"quiz": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    