from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer, util
import re

# Initialize the multilingual embedding model (supports Polish)
embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Polish stop words to filter out noise in TF-IDF
POLISH_STOP_WORDS = [
    "jest", "nie", "tak", "dla", "jak", "czy", "aby", "bez", "ten", "tym", "sie", "się",
    "oraz", "albo", "lub", "jego", "jej", "ich", "ma", "są", "jako", "przez", "tylko",
    "które", "który", "która", "może", "bardzo", "tego", "tej", "wiele", "więc", "przy"
]


def get_top_tfidf_keywords(text: str, top_n: int = 10) -> list:
    """Builds a proper TF-IDF matrix by treating sentences as documents."""

    # Clean text but preserve dots to split into sentences
    clean_text = re.sub(r'[^\w\s\.]', '', text.lower())

    # Split text into sentences to form a corpus
    sentences = [s.strip() for s in clean_text.split('.') if len(s.strip()) > 10]

    if not sentences:
        return []

    # Use stop words and treat the list of sentences as a document collection
    vectorizer = TfidfVectorizer(
        max_features=top_n,
        stop_words=POLISH_STOP_WORDS,
        token_pattern=r'(?u)\b[a-zA-Z_ąćęłńóśźż]{9,}\b'
    )

    try:
        vectorizer.fit_transform(sentences)
        feature_names = vectorizer.get_feature_names_out()
        return list(feature_names)
    except ValueError:
        return []


def get_semantic_context(text: str, keywords: list, top_k: int = 3) -> list:
    """Finds the most semantically dense sentences using vector embeddings."""
    if not keywords or not text:
        return []

    # Split raw text into clean sentences
    sentences = [s.strip() + "." for s in text.replace('\n', ' ').split('.') if len(s.strip()) > 30]
    if not sentences:
        return []

    # Join keywords to form a "query"
    query = " ".join(keywords)

    try:
        # Convert text into vectors (embeddings)
        query_emb = embedding_model.encode(query, convert_to_tensor=True)
        doc_emb = embedding_model.encode(sentences, convert_to_tensor=True)

        # Calculate cosine similarity and get the top_k most similar sentences
        hits = util.semantic_search(query_emb, doc_emb, top_k=top_k)[0]

        # Extract the original sentences based on their scores
        best_sentences = [sentences[hit['corpus_id']] for hit in hits]
        return best_sentences
    except Exception as e:
        print(f"Embedding error: {str(e)}")
        return []