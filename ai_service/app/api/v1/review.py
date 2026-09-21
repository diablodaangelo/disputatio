import json
from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_internal_token
from app.schemas.common import ApiResponse, ErrorDetail
from app.schemas.review import ReviewRequest, ReviewResultData
from app.pipelines.gemini_client import gemini_client
from app.pipelines.chunker import clean_text
from app.prompts.review_prompts import REVIEW_SYSTEM_PROMPT
from app.core.exceptions import AiServiceException

router = APIRouter()

@router.post("/review", response_model=ApiResponse[ReviewResultData])
async def generate_review(
    req: ReviewRequest,
    authenticated: bool = Depends(verify_internal_token)
):
    try:
        cleaned = clean_text(req.raw_text)
        if len(cleaned) < 50:
            raise HTTPException(status_code=400, detail="Paper text is too short or empty for review.")

        context_extra = ""
        if req.analysis_data:
            context_extra = f"PRIOR AI ANALYSIS SUMMARY:\n{json.dumps(req.analysis_data, indent=2)}\n\n"

        content = context_extra + cleaned

        result: ReviewResultData = await gemini_client.generate_structured(
            system_prompt=REVIEW_SYSTEM_PROMPT,
            user_content=content,
            response_schema_class=ReviewResultData
        )

        return ApiResponse[ReviewResultData](
            success=True,
            request_id=req.request_id,
            data=result
        )

    except AiServiceException as e:
        return ApiResponse[ReviewResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code=e.code, message=e.message)
        )
    except Exception as e:
        return ApiResponse[ReviewResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code="AI_PROCESSING_FAILED", message=str(e))
        )
