from sklearn.feature_extraction.text import TfidfVectorizer
import re


def get_top_tfidf_keywords(text: str, top_n: int = 5) -> list:
    """Builds a TF-IDF matrix and returns the most important keywords."""

    # Basic text cleaning: remove special characters and convert to lowercase
    clean_text = re.sub(r'[^\w\s]', '', text.lower())

    if not clean_text.strip():
        return []

    # Ignore short words (less than 4 letters).
    # Include Polish characters, as the academic materials are likely in Polish.
    vectorizer = TfidfVectorizer(max_features=top_n, token_pattern=r'(?u)\b[a-zA-Z_ąćęłńóśźż]{4,}\b')

    try:
        # Build the matrix
        vectorizer.fit_transform([clean_text])
        # Get the words with the highest weight (importance)
        feature_names = vectorizer.get_feature_names_out()
        return list(feature_names)
    except ValueError:
        # Fallback if the text is too short or empty after cleaning
        return []