from typing import List, Optional
from pydantic import BaseModel

class ComparisonPaperItem(BaseModel):
    id: int
    title: str
    text: str

class ComparisonRequest(BaseModel):
    request_id: str
    paper_a: ComparisonPaperItem
    paper_b: ComparisonPaperItem
    api_key: Optional[str] = None

class MatrixRow(BaseModel):
    aspect: str
    paper_a: str
    paper_b: str

class ComparisonVerdict(BaseModel):
    stronger_methodology: str
    stronger_evidence: str
    more_reproducible: str
    rationale: str

class ComparisonResultData(BaseModel):
    matrix: List[MatrixRow]
    verdict: ComparisonVerdict
