from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from recommender import MentorRecommender

app = FastAPI(title="MentorLink ML Recommendation Service")
recommender = MentorRecommender(use_transformer=False)


class StudentProfile(BaseModel):
    interests: List[str]
    goals: str


class MentorProfile(BaseModel):
    id: str
    expertise: List[str]
    bio: str
    maxCapacity: int = 3
    activeRequestsCount: int = 0
    exposureCount: int = 0


class RecommendRequest(BaseModel):
    student: StudentProfile
    mentors: List[MentorProfile]
    top_k: Optional[int] = 3


@app.get("/health")
def health():
    return {"status": "ok", "service": "mentorlink-ml"}


@app.post("/recommend")
def recommend(req: RecommendRequest):
    results = recommender.recommend(
        req.student.model_dump(),
        [m.model_dump() for m in req.mentors],
        top_k=req.top_k or 3
    )
    return {"recommendations": results}
