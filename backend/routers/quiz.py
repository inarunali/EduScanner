# backend/routers/quiz.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List
from services.pdf_service import extract_text_from_pdf
from services.llm_service import generate_quiz_from_text

router = APIRouter()

@router.post("/generate")
async def generate_quiz_endpoint(
    files: List[UploadFile] = File(...),
    numQuestions: int = Form(...),
    difficulty: str = Form(...),
    questionType: str = Form(...)
):
    try:
        extracted_text = ""
        
        # Pętla po wszystkich wgranych plikach
        for file in files:
            pdf_bytes = await file.read()
            text = await extract_text_from_pdf(pdf_bytes)
            # Doklejamy tekst i oddzielamy pliki
            extracted_text += f"\n\n--- ZAWARTA WIEDZA Z PLIKU: {file.filename} ---\n\n"
            extracted_text += text
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Błąd czytania plików: {str(e)}")

    try:
        quiz_data = generate_quiz_from_text(extracted_text, numQuestions, difficulty, questionType)
        return {"quiz": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    