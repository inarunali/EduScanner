import fitz  # PyMuPDF
import base64


async def extract_images_from_pdf(pdf_bytes: bytes, max_pages: int = 5) -> list:
    """Renders PDF pages into images and returns a list of base64 strings."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        images_base64 = []

        # Limit the number of pages to avoid exceeding API and memory limits
        for i in range(min(len(doc), max_pages)):
            page = doc[i]
            # get_pixmap takes a "picture" of the page
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("jpeg")

            # Encode to base64 as expected by the Vision API
            base64_img = base64.b64encode(img_bytes).decode('utf-8')
            images_base64.append(base64_img)

        if not images_base64:
            raise ValueError("PDF file is empty or failed to generate images.")

        return images_base64
    except Exception as e:
        raise Exception(f"PDF processing error: {str(e)}")


async def process_image_file(file_bytes: bytes) -> list:
    """Encodes an uploaded image file to a base64 string."""
    try:
        base64_img = base64.b64encode(file_bytes).decode('utf-8')
        return [base64_img]
    except Exception as e:
        raise Exception(f"Image processing error: {str(e)}")


async def extract_text_from_pdf(pdf_bytes: bytes, max_pages: int = 5) -> str:
    """Extracts raw text from a PDF to build NLP matrices."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        # Collect text from all permitted pages
        text = " ".join([doc[i].get_text() for i in range(min(len(doc), max_pages))])
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return ""