from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from services.pdf_service import extract_text_from_pdf
from services.llm_service import generate_quiz_from_text

router = APIRouter()

@router.post("/generate")
async def generate_quiz_endpoint(
    file: UploadFile = File(...),
    numQuestions: int = Form(...),
    difficulty: str = Form(...)
):
    # Krok 1: Przetworzenie PDF za pomocą dedykowanego serwisu
    try:
        pdf_bytes = await file.read()
        extracted_text = await extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Krok 2: Wysłanie tekstu do modelu Bielik
    try:
        quiz_data = generate_quiz_from_text(extracted_text, numQuestions, difficulty)
        return {"quiz": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    