from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalysisRequestMetadata(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[str]] = []
    publication_year: Optional[int] = None

class AnalysisRequest(BaseModel):
    request_id: str
    paper_id: int
    raw_text: str
    metadata: Optional[AnalysisRequestMetadata] = None

class ClassificationData(BaseModel):
    domain: str
    research_type: str

class HypothesisInfo(BaseModel):
    found: bool
    content: Optional[str] = None

class MethodologyInfo(BaseModel):
    type: str = "Unknown"
    method: str = "Not specified"
    dataset: Optional[str] = None
    sample_size: Optional[Any] = None

class SectionInfo(BaseModel):
    title: str
    page_start: Optional[int] = None
    page_end: Optional[int] = None

class StructureData(BaseModel):
    research_problem: Optional[str] = None
    research_questions: List[str] = []
    research_objective: Optional[str] = None
    hypothesis: HypothesisInfo = Field(default_factory=lambda: HypothesisInfo(found=False))
    methodology: MethodologyInfo = Field(default_factory=MethodologyInfo)
    key_findings: List[str] = []
    limitations: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    sections: List[SectionInfo] = []

class ScoreData(BaseModel):
    methodology: int = Field(ge=0, le=100)
    novelty: int = Field(ge=0, le=100)
    clarity: int = Field(ge=0, le=100)
    evidence: int = Field(ge=0, le=100)
    reproducibility: int = Field(ge=0, le=100)
    writing_quality: int = Field(ge=0, le=100)
    overall: int = Field(ge=0, le=100)
    explanations: Dict[str, str] = {}

class FindingItem(BaseModel):
    severity: str = "LOW"
    category: str
    finding: str
    explanation: str
    evidence: Optional[str] = None
    page_number: Optional[int] = None
    confidence: Optional[float] = 1.0

class ReferencesAudit(BaseModel):
    total_references: int = 0
    recent_references: int = 0
    old_references: int = 0
    uncited_references: List[str] = []
    missing_citations: List[str] = []

class AnalysisResultData(BaseModel):
    classification: ClassificationData
    structure: StructureData
    scores: ScoreData
    findings: List[FindingItem] = []
    references_audit: ReferencesAudit = Field(default_factory=ReferencesAudit)
    keywords: List[str] = []
