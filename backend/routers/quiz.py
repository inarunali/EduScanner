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
        all_base64_images = []
        combined_text = ""

        # Iterate through ALL uploaded files
        for target_file in file:
            file_bytes = await target_file.read()
            filename = target_file.filename.lower()

            if filename.endswith(".pdf"):
                # Extract images and add them to the common array
                pdf_images = await extract_images_from_pdf(file_bytes)
                all_base64_images.extend(pdf_images)

                # Extract text and concatenate it with text from other files
                pdf_text = await extract_text_from_pdf(file_bytes)
                combined_text += f" {pdf_text}"

            elif filename.endswith((".jpg", ".jpeg", ".png")):
                # Process single images and add them to the common array
                img_base64 = await process_image_file(file_bytes)
                all_base64_images.extend(img_base64)
            else:
                # If an unsupported file is encountered, just skip it to avoid breaking the generation
                print(f"Skipping unsupported file format: {filename}")

        # Check: if ultimately no useful content could be extracted
        if not all_base64_images and not combined_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No valid content found in the uploaded files. Please upload valid PDFs or images."
            )

        nlp_keywords = []
        semantic_context = []

        # Run our NLP models on the COMBINED text from all files
        if combined_text.strip():
            # Extract the 5 most important keywords from all documents combined
            nlp_keywords = get_top_tfidf_keywords(combined_text, top_n=20)
            print(f"Extracted TF-IDF Keywords from multiple files: {nlp_keywords}")

            # Find the 3 most important sentences across all documents
            if nlp_keywords:
                semantic_context = get_semantic_context(combined_text, nlp_keywords, top_k=3)
                print(f"Extracted Semantic Context from multiple files: {semantic_context}")

        # Send all collected images and the overall semantic context to the LLM
        quiz_data = generate_quiz_from_images(
            base64_images=all_base64_images,
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
        print(f"Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))