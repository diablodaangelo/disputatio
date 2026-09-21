from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_internal_token
from app.schemas.common import ApiResponse, ErrorDetail
from app.schemas.comparison import ComparisonRequest, ComparisonResultData
from app.pipelines.gemini_client import gemini_client
from app.pipelines.chunker import clean_text
from app.prompts.comparison_prompts import COMPARISON_SYSTEM_PROMPT
from app.core.exceptions import AiServiceException

router = APIRouter()

@router.post("/compare", response_model=ApiResponse[ComparisonResultData])
async def compare_papers(
    req: ComparisonRequest,
    authenticated: bool = Depends(verify_internal_token)
):
    try:
        text_a = clean_text(req.paper_a.text)
        text_b = clean_text(req.paper_b.text)

        if len(text_a) < 50 or len(text_b) < 50:
            raise HTTPException(status_code=400, detail="One or both paper texts are too short for comparison.")

        user_content = (
            f"--- PAPER A: {req.paper_a.title} (ID: {req.paper_a.id}) ---\n"
            f"{text_a}\n\n"
            f"--- PAPER B: {req.paper_b.title} (ID: {req.paper_b.id}) ---\n"
            f"{text_b}"
        )

        result: ComparisonResultData = await gemini_client.generate_structured(
            system_prompt=COMPARISON_SYSTEM_PROMPT,
            user_content=user_content,
            response_schema_class=ComparisonResultData,
            custom_api_key=req.api_key
        )

        return ApiResponse[ComparisonResultData](
            success=True,
            request_id=req.request_id,
            data=result
        )

    except AiServiceException as e:
        return ApiResponse[ComparisonResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code=e.code, message=e.message)
        )
    except Exception as e:
        return ApiResponse[ComparisonResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code="AI_PROCESSING_FAILED", message=str(e))
        )
