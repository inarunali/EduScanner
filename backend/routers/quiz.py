from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.file_service import extract_images_from_pdf, process_image_file, extract_text_from_pdf
from services.llm_service import generate_quiz_from_images
from services.nlp_service import get_top_tfidf_keywords

router = APIRouter()


@router.post("/generate")
async def generate_quiz(
        file: UploadFile = File(...),
        num_questions: int = Form(5),
        difficulty: str = Form("medium"),
        question_type: str = Form("mixed")
):
    try:
        file_bytes = await file.read()
        filename = file.filename.lower()
        base64_images = []
        nlp_keywords = []

        # 1. Route files to their respective handlers based on the extension
        if filename.endswith(".pdf"):
            base64_images = await extract_images_from_pdf(file_bytes)

            # --- NLP BLOCK (TF-IDF) ---
            # Extract text and compute the TF-IDF matrix for the keywords
            pdf_text = await extract_text_from_pdf(file_bytes)
            nlp_keywords = get_top_tfidf_keywords(pdf_text, top_n=5)
            print(f"Extracted TF-IDF Keywords: {nlp_keywords}")
            # --------------------------

        elif filename.endswith((".jpg", ".jpeg", ".png")):
            base64_images = await process_image_file(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF, JPG, or PNG file."
            )

        # 2. Pass the extracted images and keywords to the Vision model
        quiz_data = generate_quiz_from_images(
            base64_images=base64_images,
            num_questions=num_questions,
            difficulty=difficulty,
            question_type=question_type,
            nlp_keywords=nlp_keywords
        )

        # Return the generated quiz along with the extracted keywords in the 'meta' block
        return {"status": "success", "data": quiz_data, "meta": {"keywords": nlp_keywords}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))