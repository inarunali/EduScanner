import fitz  # PyMuPDF

async def extract_text_from_pdf(pdf_bytes: bytes, max_chars: int = 15000) -> str:
    """Odczytuje bajty pliku PDF i zwraca wyciągnięty z nich tekst."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()
            
        tekst_do_analizy = extracted_text[:max_chars]
        
        if not tekst_do_analizy.strip():
            raise ValueError("Plik PDF wydaje się być pusty lub jest to skan bez warstwy tekstowej (OCR).")
            
        return tekst_do_analizy
    except Exception as e:
        raise Exception(f"Błąd przetwarzania pliku PDF: {str(e)}")
    