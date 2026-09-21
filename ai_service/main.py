import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AiServiceException
from app.api.v1.health import router as health_router
from app.api.v1.analyze import router as analyze_router
from app.api.v1.review import router as review_router
from app.api.v1.qa import router as qa_router
from app.api.v1.compare import router as compare_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Python FastAPI Service for AI Academic Research Paper Analysis using Google Gemini API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, tags=["Health"])
app.include_router(analyze_router, prefix=settings.API_V1_STR, tags=["Analysis"])
app.include_router(review_router, prefix=settings.API_V1_STR, tags=["Review"])
app.include_router(qa_router, prefix=settings.API_V1_STR, tags=["Q&A"])
app.include_router(compare_router, prefix=settings.API_V1_STR, tags=["Comparison"])

@app.exception_handler(AiServiceException)
async def ai_service_exception_handler(request: Request, exc: AiServiceException):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
