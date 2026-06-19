from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
from services.file_service import extract_images_from_pdf, process_image_file, extract_text_from_pdf
from services.llm_service import generate_quiz_from_images
from services.nlp_service import get_top_tfidf_keywords, get_semantic_context

router = APIRouter()


@router.post("/generate")
async def generate_quiz(
        file: List[UploadFile] = File(...),
        num_questions: int = Form(5),
        difficulty: str = Form("medium"),
        question_type: str = Form("mixed")
):
    try:
        # We only take the first file for simplicity in processing,
        # or we can loop over them if you combined them
        target_file = file[0]
        file_bytes = await target_file.read()
        filename = target_file.filename.lower()

        base64_images = []
        nlp_keywords = []
        semantic_context = []

        if filename.endswith(".pdf"):
            base64_images = await extract_images_from_pdf(file_bytes)

            pdf_text = await extract_text_from_pdf(file_bytes)

            nlp_keywords = get_top_tfidf_keywords(pdf_text, top_n=5)
            print(f"Extracted TF-IDF Keywords: {nlp_keywords}")

            #Get Semantic Sentences based on keywords
            if nlp_keywords:
                semantic_context = get_semantic_context(pdf_text, nlp_keywords, top_k=3)
                print(f"Extracted Semantic Context (Top 3 sentences): {semantic_context}")

        elif filename.endswith((".jpg", ".jpeg", ".png")):
            base64_images = await process_image_file(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload a PDF, JPG, or PNG file."
            )

        # Pass images, keywords AND embeddings context to LLM
        quiz_data = generate_quiz_from_images(
            base64_images=base64_images,
            num_questions=num_questions,
            difficulty=difficulty,
            question_type=question_type,
            nlp_keywords=nlp_keywords,
            semantic_context=semantic_context
        )

        return {
            "status": "success",
            "data": quiz_data,
            "meta": {"keywords": nlp_keywords, "semantic_context": semantic_context}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))