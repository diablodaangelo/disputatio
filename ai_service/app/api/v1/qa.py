from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_internal_token
from app.schemas.common import ApiResponse, ErrorDetail
from app.schemas.qa import QaRequest, QaResultData
from app.pipelines.gemini_client import gemini_client
from app.pipelines.chunker import clean_text
from app.prompts.qa_prompts import QA_SYSTEM_PROMPT
from app.core.exceptions import AiServiceException

router = APIRouter()

@router.post("/qa", response_model=ApiResponse[QaResultData])
async def answer_paper_question(
    req: QaRequest,
    authenticated: bool = Depends(verify_internal_token)
):
    try:
        cleaned = clean_text(req.raw_text)
        if len(cleaned) < 50:
            raise HTTPException(status_code=400, detail="Paper text is too short or empty for Q&A.")

        user_content = f"USER QUESTION:\n{req.question}\n\nPAPER DOCUMENT:\n{cleaned}"

        result: QaResultData = await gemini_client.generate_structured(
            system_prompt=QA_SYSTEM_PROMPT,
            user_content=user_content,
            response_schema_class=QaResultData,
            custom_api_key=req.api_key
        )

        return ApiResponse[QaResultData](
            success=True,
            request_id=req.request_id,
            data=result
        )

    except AiServiceException as e:
        return ApiResponse[QaResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code=e.code, message=e.message)
        )
    except Exception as e:
        return ApiResponse[QaResultData](
            success=False,
            request_id=req.request_id,
            error=ErrorDetail(code="AI_PROCESSING_FAILED", message=str(e))
        )
