from fastapi import Header, HTTPException, status
from app.core.config import settings

async def verify_internal_token(x_internal_key: str = Header(..., alias="X-Internal-Key")):
    if x_internal_key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid internal service authentication key"
        )
    return True
