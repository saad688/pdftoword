from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            from starlette.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={"error": "Internal server error"}
            )