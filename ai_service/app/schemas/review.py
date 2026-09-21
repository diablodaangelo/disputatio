from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ReviewRequest(BaseModel):
    request_id: str
    paper_id: int
    raw_text: str
    analysis_data: Optional[Dict[str, Any]] = None

class ReviewResultData(BaseModel):
    recommendation: str  # ACCEPT, MINOR_REVISION, MAJOR_REVISION, REJECT
    summary: str
    strengths: List[str] = []
    major_concerns: List[str] = []
    minor_concerns: List[str] = []
    methodology_review: str
    novelty_review: str
    result_review: str
    reproducibility_review: str
