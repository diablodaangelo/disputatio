from typing import Optional
from pydantic import BaseModel

class QaRequest(BaseModel):
    request_id: str
    paper_id: int
    question: str
    raw_text: str
    api_key: Optional[str] = None

class QaEvidence(BaseModel):
    page: Optional[int] = None
    section: Optional[str] = None
    quote: Optional[str] = None

class QaResultData(BaseModel):
    answer: str
    found: bool
    evidence: Optional[QaEvidence] = None
