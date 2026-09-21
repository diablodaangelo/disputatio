from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    request_id: str
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None
