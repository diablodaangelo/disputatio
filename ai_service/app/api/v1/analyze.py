from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_internal_token
from app.schemas.common import ApiResponse, ErrorDetail
from app.schemas.analysis import AnalysisRequest, AnalysisResultData
from app.pipelines.gemini_client import gemini_client
from app.pipelines.chunker import clean_text
from app.prompts.analysis_prompts import ANALYSIS_SYSTEM_PROMPT
from app.core.exceptions import AiServiceException

router = APIRouter()

@router.post("/analyze", response_model=ApiResponse[AnalysisResultData])
async def analyze_paper(
    req: AnalysisRequest,
    authenticated: bool = Depends(verify_internal_token)
):
    try:
        cleaned = clean_text(req.raw_text)
        if len(cleaned) < 50:
            raise HTTPException(status_code=400, detail="Paper text is too short or empty for analysis.")

        # If metadata provided, augment context
        context_header = ""
        if req.metadata:
            context_header = (
                f"Title: {req.metadata.title or 'Unknown'}\n"
                f"Authors: {', '.join(req.metadata.authors or [])}\n"
                f"Publication Year: {req.metadata.publication_year or 'Unknown'}\n\n"
            )

        content = context_header + cleaned

        result: AnalysisResultData = await gemini_client.generate_structured(
            system_prompt=ANALYSIS_SYSTEM_PROMPT,
            user_content=content,
            response_schema_class=AnalysisResultData
        )

        return ApiResponse[AnalysisResultData](
            success=True,
            request_id=req.request_id,
            data=result
        )

    except AiServiceException as e:
        return ApiResponse[AnalysisResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code=e.code, message=e.message)
        )
    except Exception as e:
        return ApiResponse[AnalysisResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code="AI_PROCESSING_FAILED", message=str(e))
        )
