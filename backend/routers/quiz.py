from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.file_service import extract_images_from_pdf, process_image_file
from services.llm_service import generate_quiz_from_images

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

        #Route files to their respective handlers based on the extension
        if filename.endswith(".pdf"):
            base64_images = await extract_images_from_pdf(file_bytes)
        elif filename.endswith((".jpg", ".jpeg", ".png")):
            base64_images = await process_image_file(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Nieobsługiwany format pliku. Wgraj plik PDF, JPG lub PNG."
            )

        #Send the extracted images to the Vision model
        quiz_data = generate_quiz_from_images(
            base64_images=base64_images,
            num_questions=num_questions,
            difficulty=difficulty,
            question_type=question_type
        )

        return {"status": "success", "data": quiz_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))