import logging
import os
import json
from datetime import datetime, date
import uuid
from pathlib import Path
from typing import Dict, Any
from fastapi import Request
import time

class DetailedLogger:
    def __init__(self):
        self.base_dir = Path("logs")
        self.cost_dir = Path("cost_tracking")
        self._setup_directories()
        self._setup_logger()
        
    def _setup_directories(self):
        now = datetime.now()
        self.log_path = self.base_dir / str(now.year) / f"{now.month:02d}" / f"{now.day:02d}"
        self.cost_path = self.cost_dir / str(now.year) / f"{now.month:02d}" / f"{now.day:02d}"
        
        self.log_path.mkdir(parents=True, exist_ok=True)
        self.cost_path.mkdir(parents=True, exist_ok=True)
        
    def _setup_logger(self):
        log_file = self.log_path / f"api_{datetime.now().strftime('%H')}.log"
        
        self.logger = logging.getLogger("PDFToWordAPI")
        self.logger.setLevel(logging.DEBUG)
        
        if not self.logger.handlers:
            handler = logging.FileHandler(log_file, encoding='utf-8')
            formatter = logging.Formatter(
                '%(asctime)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        
    def log_request_start(self, request: Request, endpoint: str, params: Dict[str, Any] = None):
        """Log incoming request details"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        content_length = request.headers.get("content-length", "0")
        referer = request.headers.get("referer", "unknown")
        
        log_data = {
            "endpoint": endpoint,
            "method": request.method,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "content_length": content_length,
            "referer": referer,
            "query_params": dict(request.query_params),
            "path_params": dict(request.path_params) if hasattr(request, 'path_params') else {},
            "headers": dict(request.headers),
            "params": params or {},
            "timestamp": datetime.now().isoformat(),
            "request_id": str(uuid.uuid4())[:8]
        }
        
        self.logger.info(f"REQUEST_START | {endpoint} | {json.dumps(log_data, default=str)}")
        
    def log_request_end(self, endpoint: str, file_id: str, status: str, duration: float, response_size: int = 0):
        """Log request completion"""
        log_data = {
            "endpoint": endpoint,
            "file_id": file_id,
            "status": status,
            "duration_seconds": round(duration, 4),
            "response_size_bytes": response_size,
            "performance_category": "fast" if duration < 1 else "medium" if duration < 5 else "slow",
            "timestamp": datetime.now().isoformat()
        }
        
        self.logger.info(f"REQUEST_END | {endpoint} | {json.dumps(log_data)}")
        
    def log_progress(self, file_id: str, progress: int, message: str):
        """Log processing progress with detailed info"""
        progress_data = {
            "file_id": file_id,
            "progress_percent": progress,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "stage": self._get_progress_stage(progress)
        }
        
        self.logger.debug(f"PROGRESS | {file_id} | {json.dumps(progress_data)}")
        
    def _get_progress_stage(self, progress: int) -> str:
        """Categorize progress stages"""
        if progress < 10: return "initialization"
        elif progress < 30: return "upload"
        elif progress < 70: return "ai_processing"
        elif progress < 90: return "document_creation"
        else: return "completion"
        
    def log_cost(self, file_id: str, tokens: int, cost: float, model: str, operation_type: str = "conversion"):
        """Log and track API costs with detailed breakdown"""
        cost_data = {
            "timestamp": datetime.now().isoformat(),
            "file_id": file_id,
            "tokens": tokens,
            "cost": cost,
            "model": model,
            "operation_type": operation_type,
            "cost_per_token": round(cost / tokens, 8) if tokens > 0 else 0,
            "cost_category": "low" if cost < 0.01 else "medium" if cost < 0.05 else "high"
        }
        
        self.logger.info(f"COST | {file_id} | {json.dumps(cost_data)}")
        
        # Save to cost tracking
        cost_file = self.cost_path / f"costs_{datetime.now().strftime('%H')}.json"
        
        costs = []
        if cost_file.exists():
            with open(cost_file, 'r') as f:
                costs = json.load(f)
        
        costs.append(cost_data)
        
        with open(cost_file, 'w') as f:
            json.dump(costs, f, indent=2)
            
        self._update_daily_summary(cost)
        
    def log_error(self, file_id: str, error: str, traceback_info: str = None):
        """Log errors with full details"""
        error_data = {
            "file_id": file_id,
            "error": error,
            "traceback": traceback_info,
            "timestamp": datetime.now().isoformat()
        }
        
        self.logger.error(f"ERROR | {file_id} | {json.dumps(error_data)}")
        
    def _update_daily_summary(self, cost: float):
        summary_file = self.cost_path / "daily_summary.json"
        
        summary = {"date": date.today().isoformat(), "total_cost": 0.0, "request_count": 0}
        if summary_file.exists():
            with open(summary_file, 'r') as f:
                summary = json.load(f)
        
        summary["total_cost"] += cost
        summary["request_count"] += 1
        
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
            
        self._update_monthly_summary(cost)
        
    def _update_monthly_summary(self, cost: float):
        monthly_file = self.cost_dir / str(datetime.now().year) / f"{datetime.now().month:02d}" / "monthly_summary.json"
        
        summary = {"month": f"{datetime.now().year}-{datetime.now().month:02d}", "total_cost": 0.0, "total_requests": 0}
        if monthly_file.exists():
            with open(monthly_file, 'r') as f:
                summary = json.load(f)
        
        summary["total_cost"] += cost
        summary["total_requests"] += 1
        
        with open(monthly_file, 'w') as f:
            json.dump(summary, f, indent=2)

logger = DetailedLogger()