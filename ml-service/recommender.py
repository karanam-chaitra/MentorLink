import math
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer
    _ST_AVAILABLE = True
except Exception:
    _ST_AVAILABLE = False


class MentorRecommender:
    """
    Recommends mentors based on semantic similarity between mentee goals/interests
    and mentor expertise/bio, with:
      1. Capacity filtering (excludes mentors at full capacity)
      2. Fair-exposure re-ranking (penalizes over-exposed popular mentors)
    """
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", use_transformer: bool = True, fairness_alpha: float = 0.15):
        self.fairness_alpha = fairness_alpha
        self.model = None
        if use_transformer and _ST_AVAILABLE:
            try:
                self.model = SentenceTransformer(model_name)
            except Exception:
                self.model = None

    def _compute_similarities(self, query_text: str, mentor_texts: List[str]) -> List[float]:
        if not mentor_texts:
            return []
        if self.model is not None:
            q_emb = self.model.encode([query_text], normalize_embeddings=True)
            m_embs = self.model.encode(mentor_texts, normalize_embeddings=True)
            sims = cosine_similarity(q_emb, m_embs)[0]
            return [float(s) for s in sims]

        vectorizer = TfidfVectorizer(stop_words="english")
        matrix = vectorizer.fit_transform([query_text] + mentor_texts)
        sims = cosine_similarity(matrix[0:1], matrix[1:])[0]
        return [float(s) for s in sims]

    def recommend(self, student: Dict[str, Any], mentors: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        eligible = [
            m for m in mentors
            if m.get("activeRequestsCount", 0) < m.get("maxCapacity", 1)
        ]
        if not eligible:
            return []

        student_text = " ".join(student.get("interests", [])) + " " + student.get("goals", "")
        mentor_texts = [
            " ".join(m.get("expertise", [])) + " " + m.get("bio", "")
            for m in eligible
        ]
        raw_sims = self._compute_similarities(student_text, mentor_texts)

        scored = []
        for mentor, sim in zip(eligible, raw_sims):
            exposure = max(0, mentor.get("exposureCount", 0))
            fairness_penalty = self.fairness_alpha * math.log1p(exposure)
            final_score = round(max(0.0, sim - fairness_penalty), 4)
            scored.append({
                "mentorId": mentor["id"],
                "similarityScore": round(sim, 4),
                "fairnessPenalty": round(fairness_penalty, 4),
                "finalScore": final_score,
                "remainingCapacity": mentor.get("maxCapacity", 1) - mentor.get("activeRequestsCount", 0)
            })

        scored.sort(key=lambda x: x["finalScore"], reverse=True)
        return scored[:top_k]
