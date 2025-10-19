from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form, Request, Depends, Header
from fastapi.concurrency import run_in_threadpool
from fastapi.exceptions import HTTPException as FastAPIHTTPException
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import uuid
import aiofiles
from pydantic import BaseModel
import sys
import time
import traceback
import logging
from collections import deque
from threading import Lock
import psutil
import platform
import hashlib
from docx import Document
from docx.shared import Inches

# Security & runtime config via env
API_KEY = os.getenv("API_KEY", "")
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "*")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "150"))  # max upload in MB
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "4"))

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gemini_converter_enhanced import EnhancedGeminiConverter

# Ultra-detailed deferred logging system with day/month organization
log_buffer = deque(maxlen=50000)
log_lock = Lock()

class UltraDetailedLogger:
    def __init__(self):
        self.buffer = log_buffer
        self.lock = log_lock
        self.last_flush = time.time()
        self.session_id = hashlib.md5(str(time.time()).encode()).hexdigest()[:8]
        self.request_counter = 0
        self.ensure_directories()
    
    def ensure_directories(self):
        now = datetime.now()
        year = now.strftime('%Y')
        month = now.strftime('%m')
        day = now.strftime('%d')
        
        # Create logs directory structure: logs/YYYY/MM/DD/
        log_dir = os.path.join('logs', year, month, day)
        os.makedirs(log_dir, exist_ok=True)
        
        # Create cost tracking directory structure: cost_tracking/YYYY/MM/DD/
        cost_dir = os.path.join('cost_tracking', year, month, day)
        os.makedirs(cost_dir, exist_ok=True)
    
    def get_system_metrics(self):
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'memory_available': psutil.virtual_memory().available,
            'disk_usage': psutil.disk_usage('/').percent,
            'active_threads': threading.active_count(),
            'process_memory': psutil.Process().memory_info().rss,
            'open_files': len(psutil.Process().open_files()),
            'network_connections': len(psutil.net_connections())
        }
    
    def log(self, level, message, **kwargs):
        self.request_counter += 1
        timestamp = datetime.now().isoformat(timespec='microseconds')
        
        log_entry = {
            'session_id': self.session_id,
            'request_id': self.request_counter,
            'timestamp': timestamp,
            'level': level,
            'message': message,
            'system_metrics': self.get_system_metrics(),
            'thread_id': threading.current_thread().ident,
            'process_id': os.getpid(),
            **kwargs
        }
        
        with self.lock:
            self.buffer.append(log_entry)
    
    def flush_if_idle(self):
        if time.time() - self.last_flush > 1.5:
            self.flush_logs()
    
    def flush_logs(self):
        if not self.buffer:
            return
        
        with self.lock:
            logs_to_write = list(self.buffer)
            self.buffer.clear()
        
        try:
            now = datetime.now()
            year = now.strftime('%Y')
            month = now.strftime('%m')
            day = now.strftime('%d')
            hour = now.strftime('%H')
            
            # Ensure directory exists
            log_dir = os.path.join('logs', year, month, day)
            os.makedirs(log_dir, exist_ok=True)
            
            log_file = os.path.join(log_dir, f'api_{hour}.log')
            
            with open(log_file, 'a', encoding='utf-8') as f:
                for log in logs_to_write:
                    f.write(f"\n{'='*100}\n")
                    f.write(f"SESSION: {log['session_id']} | REQUEST: {log['request_id']} | THREAD: {log['thread_id']}\n")
                    f.write(f"TIMESTAMP: {log['timestamp']} | LEVEL: {log['level']}\n")
                    f.write(f"MESSAGE: {log['message']}\n")
                    
                    if 'details' in log:
                        f.write(f"\nDETAILS:\n")
                        for key, value in log['details'].items():
                            f.write(f"  {key}: {value}\n")
                    
                    if 'metrics' in log:
                        f.write(f"\nMETRICS:\n")
                        for key, value in log['metrics'].items():
                            f.write(f"  {key}: {value}\n")
                    
                    f.write(f"\nSYSTEM METRICS:\n")
                    for key, value in log['system_metrics'].items():
                        f.write(f"  {key}: {value}\n")
                    
                    if 'request_data' in log:
                        f.write(f"\nREQUEST DATA:\n")
                        for key, value in log['request_data'].items():
                            f.write(f"  {key}: {str(value)[:500]}{'...' if len(str(value)) > 500 else ''}\n")
                    
                    if 'processing_steps' in log:
                        f.write(f"\nPROCESSING STEPS:\n")
                        for i, step in enumerate(log['processing_steps']):
                            f.write(f"  Step {i+1}: {step}\n")
        except Exception as e:
            pass
        
        self.last_flush = time.time()
    
    def log_cost_tracking(self, cost_data):
        try:
            now = datetime.now()
            year = now.strftime('%Y')
            month = now.strftime('%m')
            day = now.strftime('%d')
            hour = now.strftime('%H')
            
            # Ensure directory exists
            cost_dir = os.path.join('cost_tracking', year, month, day)
            os.makedirs(cost_dir, exist_ok=True)
            
            cost_file = os.path.join(cost_dir, f'costs_{hour}.json')
            
            # Load existing data or create new
            if os.path.exists(cost_file):
                with open(cost_file, 'r') as f:
                    data = json.load(f)
            else:
                data = {'entries': []}
            
            # Add new entry
            data['entries'].append({
                'timestamp': now.isoformat(),
                **cost_data
            })
            
            # Save updated data
            with open(cost_file, 'w') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            pass

class LoggerSystem:
    def __init__(self):
        self.logger = UltraDetailedLogger()
        self.setup_directories()
    
    def setup_directories(self):
        os.makedirs('uploads', exist_ok=True)
        os.makedirs('outputs', exist_ok=True)
        os.makedirs('cache', exist_ok=True)
        os.makedirs('ocr_cache', exist_ok=True)

logger_system = LoggerSystem()
deferred_logger = logger_system.logger

# FastAPI app with production settings
app = FastAPI(
    title="PDF to Word Converter API",
    description="Professional PDF to Word conversion service powered by Google Gemini AI with comprehensive logging and cost tracking",
    version="2.0.0",
    docs_url="/docs",  # Always enable docs
    redoc_url="/redoc"  # Always enable redoc
)

# Setup CORS using ALLOWED_ORIGINS_ENV
origins = [o.strip() for o in ALLOWED_ORIGINS_ENV.split(",") if o.strip()]
if not origins:
    origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API key dependency for endpoints
def require_api_key(x_api_key: Optional[str] = Header(None)):
    if API_KEY and x_api_key != API_KEY:
        raise FastAPIHTTPException(status_code=401, detail="Invalid or missing API key")

# Configuration
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Global state
files_db: Dict[str, dict] = {}
converter = None
# Thread pool sized via env
thread_pool = ThreadPoolExecutor(max_workers=MAX_WORKERS)
file_locks = {}

def get_converter():
    global converter
    if converter is None:
        converter = EnhancedGeminiConverter()
    return converter

class FileStatus(BaseModel):
    id: str
    name: str
    status: str
    progress: int
    progress_message: str = ""
    upload_date: datetime
    expiry_date: datetime
    file_size: int
    word_count: int = 0
    char_count: int = 0
    line_count: int = 0
    extracted_text: str = ""
    pages_data: list = []

class CorrectionRequest(BaseModel):
    selected_text: str
    correction: str

class SaveTextRequest(BaseModel):
    text: str

class ExportRequest(BaseModel):
    format: str

def calculate_text_stats(text: str) -> dict:
    return {
        "word_count": len(text.split()),
        "char_count": len(text),
        "line_count": len(text.split('\n'))
    }

def update_progress(file_id: str, progress: int, message: str = ""):
    if file_id in files_db:
        lock = file_locks.get(file_id)
        if lock:
            with lock:
                files_db[file_id]["progress"] = progress
                files_db[file_id]["progress_message"] = message
        else:
            files_db[file_id]["progress"] = progress
            files_db[file_id]["progress_message"] = message
        
        files_db[file_id]['last_progress'] = progress

def process_file_sync(file_id: str, file_path: str, use_cache: bool = True):
    try:
        files_db[file_id]["status"] = "processing"
        update_progress(file_id, 5, "Initializing...")
        
        output_path = os.path.join(OUTPUT_DIR, f"{file_id}.docx")
        
        def progress_callback(progress: int, message: str):
            update_progress(file_id, progress, message)
            time.sleep(0.1)
        
        result = get_converter().convert_single(file_path, output_path, progress_callback, use_cache=use_cache)
        
        file_hash = get_converter().get_file_hash(file_path)
        cached = get_converter().load_cache(file_hash) if use_cache else None
        
        extracted_text = ""
        pages_data = []
        
        if cached and use_cache:
            extracted_text = get_converter().extract_text_for_preview(cached)
            pages_data = get_converter().get_pages_data(cached)
        
        if not extracted_text:
            extracted_text = "Text extraction completed. Download the Word document to view content."
        
        # Log cost tracking
        try:
            usage = get_converter().get_usage_stats()
            if usage and usage.get('total_tokens', 0) > 0:
                cost_data = {
                    'file_id': file_id,
                    'operation': 'pdf_conversion',
                    'total_tokens': usage.get('total_tokens', 0),
                    'estimated_cost': usage.get('estimated_cost', 0),
                    'model': 'gemini-2.5-pro',
                    'processing_time': time.time() - files_db[file_id].get('start_time', time.time())
                }
                deferred_logger.log_cost_tracking(cost_data)
                deferred_logger.log('COST', f'API usage for file {file_id}', details=cost_data)
        except Exception:
            pass
        
        stats = calculate_text_stats(extracted_text)
        files_db[file_id].update({
            "status": "completed",
            "progress": 100,
            "progress_message": "Completed!",
            "extracted_text": extracted_text,
            "pages_data": pages_data,
            "output_path": result,
            **stats
        })
        
        return result
        
    except Exception as e:
        files_db[file_id].update({
            "status": "error",
            "progress": 0,
            "progress_message": "Failed",
            "error": str(e)
        })
        raise e

def process_batch_background(file_ids: List[str], file_paths: List[str]):
    """Process multiple files in batch with optimized threading"""
    try:
        for i, (file_id, file_path) in enumerate(zip(file_ids, file_paths)):
            file_locks[file_id] = threading.Lock()
            files_db[file_id]['start_time'] = time.time()
            
            # Process each file
            process_file_sync(file_id, file_path, files_db[file_id].get('use_cache', True))
            
            # Clean up lock
            file_locks.pop(file_id, None)
            
        deferred_logger.flush_if_idle()
        
    except Exception as e:
        deferred_logger.log('ERROR', f'Batch processing failed: {str(e)}')

async def process_file_background(file_id: str, file_path: str, use_cache: bool = True):
    file_locks[file_id] = threading.Lock()
    
    if file_id in files_db:
        files_db[file_id]['start_time'] = time.time()
    
    try:
        await run_in_threadpool(process_file_sync, file_id, file_path, use_cache)
    finally:
        file_locks.pop(file_id, None)
        deferred_logger.flush_if_idle()

@app.post("/api/upload", dependencies=[Depends(require_api_key)])
@app.post("/upload", dependencies=[Depends(require_api_key)])
async def upload_file(request: Request, background_tasks: BackgroundTasks, file: UploadFile = File(...), use_cache: str = Form("true")):
    # parse boolean
    use_cache_bool = str(use_cache).lower() == "true"

    # ensure extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_id = str(uuid.uuid4())
    safe_name = file.filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{safe_name}")

    # stream to disk in chunks to avoid high memory use
    size = 0
    CHUNK_SIZE = 1024 * 1024  # 1 MB
    async with aiofiles.open(file_path, 'wb') as out_f:
        while True:
            chunk = await file.read(CHUNK_SIZE)
            if not chunk:
                break
            await out_f.write(chunk)
            size += len(chunk)
            # enforce limit
            if size > MAX_UPLOAD_MB * 1024 * 1024:
                await out_f.close()
                try:
                    os.remove(file_path)
                except Exception:
                    pass
                raise HTTPException(status_code=413, detail=f"File too large. Max {MAX_UPLOAD_MB} MB allowed.")

    files_db[file_id] = {
        "id": file_id,
        "name": file.filename,
        "status": "processing",
        "progress": 0,
        "upload_date": datetime.now().isoformat(),
        "expiry_date": (datetime.now() + timedelta(days=2)).isoformat(),
        "file_size": size,
        "file_path": file_path,
        "word_count": 0,
        "char_count": 0,
        "line_count": 0,
        "extracted_text": "",
        "progress_message": "Uploaded",
        "pages_data": [],
        "use_cache": use_cache_bool
    }

    # schedule background processing (non-blocking)
    background_tasks.add_task(process_file_background, file_id, file_path, use_cache_bool)

    response_data = files_db[file_id].copy()
    response_data.pop("file_path", None)
    return {"file_id": file_id, "message": "File uploaded successfully", "file_data": response_data}

@app.post("/api/upload-batch", dependencies=[Depends(require_api_key)])
@app.post("/upload-batch", dependencies=[Depends(require_api_key)])
async def upload_batch(request: Request, background_tasks: BackgroundTasks, files: List[UploadFile] = File(...), use_cache: str = Form("true")):
    use_cache_bool = str(use_cache).lower() == "true"
    file_ids = []

    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            continue

        file_id = str(uuid.uuid4())
        safe_name = file.filename.replace(" ", "_")
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{safe_name}")

        # stream each file
        size = 0
        CHUNK_SIZE = 1024 * 1024
        async with aiofiles.open(file_path, 'wb') as out_f:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                await out_f.write(chunk)
                size += len(chunk)
                if size > MAX_UPLOAD_MB * 1024 * 1024:
                    await out_f.close()
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass
                    continue  # skip oversized file

        files_db[file_id] = {
            "id": file_id,
            "name": file.filename,
            "status": "processing",
            "progress": 0,
            "upload_date": datetime.now().isoformat(),
            "expiry_date": (datetime.now() + timedelta(days=2)).isoformat(),
            "file_size": size,
            "file_path": file_path,
            "word_count": 0,
            "char_count": 0,
            "line_count": 0,
            "extracted_text": "",
            "use_cache": use_cache_bool
        }
        file_ids.append(file_id)

    if file_ids:
        file_paths = [files_db[fid]["file_path"] for fid in file_ids]
        background_tasks.add_task(process_batch_background, file_ids, file_paths)

    return {"file_ids": file_ids, "message": f"Uploaded {len(file_ids)} files"}

@app.get("/api/files/{file_id}")
@app.get("/files/{file_id}")
async def get_file_status(file_id: str):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id].copy()
    file_data.pop("file_path", None)
    file_data.pop("output_path", None)
    
    return file_data

@app.get("/api/files")
@app.get("/files")
async def get_all_files():
    result = []
    for file_data in files_db.values():
        clean_data = file_data.copy()
        clean_data.pop("file_path", None)
        clean_data.pop("output_path", None)
        result.append(clean_data)
    
    return {"files": result}

@app.put("/api/files/{file_id}/text")
async def update_file_text(file_id: str, text: dict):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    new_text = text.get("text", "")
    stats = calculate_text_stats(new_text)
    
    files_db[file_id].update({
        "extracted_text": new_text,
        **stats
    })
    
    return {"message": "Text updated successfully"}

@app.post("/api/files/{file_id}/ai-correct")
async def ai_correct_text(file_id: str, request: dict):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    selected_text = request.get("selected_text", "")
    user_explanation = request.get("user_explanation", "")
    
    # Get page context for the selected text
    file_data = files_db[file_id]
    pages_data = file_data.get("pages_data", [])
    
    # Find which page contains the selected text
    page_context = ""
    for page in pages_data:
        if selected_text in page.get("content", ""):
            page_context = page.get("content", "")
            break
    
    # AI correction prompt
    correction_prompt = f"""
    You are a text correction expert. Correct the following text based on the user's explanation.
    
    SELECTED TEXT TO CORRECT:
    "{selected_text}"
    
    USER'S EXPLANATION OF THE ISSUE:
    "{user_explanation}"
    
    PAGE CONTEXT (for reference):
    "{page_context[:500]}..."
    
    INSTRUCTIONS:
    1. Only return the corrected version of the selected text
    2. Maintain the original formatting and structure
    3. Fix only what the user described as incorrect
    4. Do not add extra text or explanations
    5. Preserve any markdown formatting (**bold**, *italic*, etc.)
    
    CORRECTED TEXT:
    """
    
    try:
        # Use Gemini for correction
        response = get_converter().client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[correction_prompt]
        )
        
        corrected_text = response.text.strip()
        
        # Log AI correction cost
        try:
            usage = get_converter().get_usage_stats()
            if usage and usage.get('total_tokens', 0) > 0:
                cost_data = {
                    'file_id': file_id,
                    'operation': 'ai_correction',
                    'tokens_used': usage.get('total_tokens', 0),
                    'estimated_cost': usage.get('estimated_cost', 0),
                    'selected_text_length': len(selected_text),
                    'corrected_text_length': len(corrected_text)
                }
                deferred_logger.log_cost_tracking(cost_data)
                deferred_logger.log('AI_COST', f'AI correction for file {file_id}', details=cost_data)
        except Exception:
            pass
        
        # Remove any quotes or extra formatting from response
        if corrected_text.startswith('"') and corrected_text.endswith('"'):
            corrected_text = corrected_text[1:-1]
        
        return {"corrected_text": corrected_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI correction failed: {str(e)}")

@app.post("/api/files/{file_id}/correct")
async def correct_text(file_id: str, correction: CorrectionRequest):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    current_text = files_db[file_id]["extracted_text"]
    corrected_text = current_text.replace(correction.selected_text, correction.correction)
    
    stats = calculate_text_stats(corrected_text)
    files_db[file_id].update({
        "extracted_text": corrected_text,
        **stats
    })
    
    return {"message": "Text corrected successfully"}

@app.post("/api/files/{file_id}/save")
async def save_text_to_docx(file_id: str, request: SaveTextRequest):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id]
    output_path = file_data.get("output_path")
    
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="DOCX file not found")
    
    try:
        # Create new document with the updated text
        doc = Document()
        paragraphs = request.text.split('\n\n')
        for paragraph_text in paragraphs:
            if paragraph_text.strip():
                doc.add_paragraph(paragraph_text.strip())
        
        # Save to the existing output path
        doc.save(output_path)
        
        # Update file stats
        stats = calculate_text_stats(request.text)
        files_db[file_id].update({
            "extracted_text": request.text,
            **stats
        })
        
        return {"message": "Changes saved to DOCX successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save changes: {str(e)}")

@app.post("/api/files/{file_id}/export")
async def export_file(file_id: str, request: ExportRequest):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id]
    extracted_text = file_data.get("extracted_text", "")
    
    try:
        export_dir = os.path.join(OUTPUT_DIR, "exports")
        os.makedirs(export_dir, exist_ok=True)
        
        base_name = os.path.splitext(file_data["name"])[0]
        
        if request.format == "txt":
            export_path = os.path.join(export_dir, f"{file_id}_{base_name}.txt")
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(extracted_text)
                
        elif request.format == "html":
            export_path = os.path.join(export_dir, f"{file_id}_{base_name}.html")
            paragraphs = ''.join(f'<p>{line}</p>' for line in extracted_text.split('\n') if line.strip())
            html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{base_name}</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }}
        p {{ margin-bottom: 1em; }}
    </style>
</head>
<body>
    {paragraphs}
</body>
</html>"""
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
        elif request.format == "rtf":
            export_path = os.path.join(export_dir, f"{file_id}_{base_name}.rtf")
            rtf_text = extracted_text.replace('\n', '\\par ')
            rtf_content = f"{{\\rtf1\\ansi\\deff0 {{\\fonttbl {{\\f0 Times New Roman;}}}} \\f0\\fs24 {rtf_text}}}"
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(rtf_content)
                
        elif request.format == "pdf":
            try:
                from reportlab.pdfgen import canvas
                from reportlab.lib.pagesizes import letter
                
                export_path = os.path.join(export_dir, f"{file_id}_{base_name}.pdf")
                c = canvas.Canvas(export_path, pagesize=letter)
                width, height = letter
                
                y = height - 50
                for line in extracted_text.split('\n'):
                    if y < 50:
                        c.showPage()
                        y = height - 50
                    c.drawString(50, y, line[:80])
                    y -= 20
                
                c.save()
            except ImportError:
                # Fallback to TXT if reportlab not available
                export_path = os.path.join(export_dir, f"{file_id}_{base_name}.txt")
                with open(export_path, 'w', encoding='utf-8') as f:
                    f.write(extracted_text)
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
        if not os.path.exists(export_path):
            raise HTTPException(status_code=500, detail="Export failed")
        
        return {"export_path": os.path.basename(export_path), "message": f"File exported as {request.format.upper()}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@app.get("/api/files/{file_id}/export/{export_path:path}")
async def download_export(file_id: str, export_path: str):
    full_path = os.path.join(OUTPUT_DIR, "exports", os.path.basename(export_path))
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Export file not found")
    
    ext = os.path.splitext(full_path)[1].lower()
    media_types = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.rtf': 'application/rtf',
        '.html': 'text/html'
    }
    
    media_type = media_types.get(ext, 'application/octet-stream')
    
    return FileResponse(
        full_path,
        media_type=media_type,
        filename=os.path.basename(full_path)
    )

@app.get("/api/files/{file_id}/pdf")
@app.get("/files/{file_id}/pdf")
async def get_pdf_file(file_id: str):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id]
    file_path = file_data.get("file_path")
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=file_data["name"]
    )

@app.get("/api/files/{file_id}/download")
@app.get("/files/{file_id}/download")
async def download_file(file_id: str):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id]
    if file_data["status"] != "completed":
        raise HTTPException(status_code=400, detail="File not ready for download")
    
    output_path = file_data.get("output_path")
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    filename = file_data["name"].replace(".pdf", ".docx")
    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=filename
    )

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str):
    if file_id not in files_db:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = files_db[file_id]
    
    for path_key in ["file_path", "output_path"]:
        if path_key in file_data and os.path.exists(file_data[path_key]):
            os.remove(file_data[path_key])
    
    del files_db[file_id]
    
    return {"message": "File deleted successfully"}

@app.get("/api/health")
@app.get("/health")
async def health_check():
    deferred_logger.flush_if_idle()
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def backend_status():
    """Endpoint for frontend to check if backend is connected"""
    return {
        "status": "connected", 
        "message": "Backend is running",
        "active_files": len(files_db)
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"🚀 Starting PDF to Word API server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False, access_log=False, log_level="info")