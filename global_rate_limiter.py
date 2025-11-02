import time
import threading
from typing import Dict, Optional
from dataclasses import dataclass
from queue import Queue, Empty
import logging

@dataclass
class RateLimitConfig:
    rpm: int  # requests per minute
    delay: float  # seconds between requests
    concurrent: int  # max concurrent requests

class GlobalRateLimiter:
    """Global rate limiter to handle all API requests across the application"""
    
    def __init__(self):
        self.lock = threading.Lock()
        self.last_request_time = 0
        self.active_requests = 0
        self.request_queue = Queue()
        self.current_config: Optional[RateLimitConfig] = None
        self.processing_files = set()
        
    def set_rate_limit(self, config: RateLimitConfig):
        """Set the rate limit configuration based on processing mode"""
        with self.lock:
            self.current_config = config
            
    def can_process_file(self, file_id: str) -> bool:
        """Check if we can start processing a new file"""
        with self.lock:
            if not self.current_config:
                return False
            
            # Check if already processing
            if file_id in self.processing_files:
                return False
                
            # Check concurrent limit
            if self.active_requests >= self.current_config.concurrent:
                return False
                
            return True
    
    def acquire_slot(self, file_id: str) -> bool:
        """Acquire a processing slot with rate limiting"""
        if not self.can_process_file(file_id):
            return False
            
        with self.lock:
            # Rate limiting
            if self.current_config:
                elapsed = time.time() - self.last_request_time
                if elapsed < self.current_config.delay:
                    time.sleep(self.current_config.delay - elapsed)
                
                self.last_request_time = time.time()
                self.active_requests += 1
                self.processing_files.add(file_id)
                
        return True
    
    def release_slot(self, file_id: str):
        """Release a processing slot"""
        with self.lock:
            if file_id in self.processing_files:
                self.processing_files.remove(file_id)
                self.active_requests = max(0, self.active_requests - 1)
    
    def get_queue_position(self, file_id: str) -> int:
        """Get position in processing queue"""
        with self.lock:
            if file_id in self.processing_files:
                return 0  # Currently processing
            
            # Count files ahead in queue
            processing_count = len(self.processing_files)
            return processing_count + 1
    
    def get_status(self) -> Dict:
        """Get current rate limiter status"""
        with self.lock:
            return {
                "active_requests": self.active_requests,
                "processing_files": list(self.processing_files),
                "max_concurrent": self.current_config.concurrent if self.current_config else 0,
                "current_delay": self.current_config.delay if self.current_config else 0
            }

# Global instance
rate_limiter = GlobalRateLimiter()