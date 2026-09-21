class AiServiceException(Exception):
    def __init__(self, message: str, code: str = "AI_PROCESSING_FAILED"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class GeminiApiException(AiServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="GEMINI_API_ERROR")

class PydanticValidationException(AiServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="SCHEMA_VALIDATION_ERROR")
