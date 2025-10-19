import os
import re
import json
import time
import logging
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, List, Callable

# External Libraries
from google import genai
from docx import Document
from dotenv import load_dotenv

# --- PROMPT: Structured Document Extraction ---
PROMPT_FULL_DOCUMENT_EXTRACTION = r"""
You are an expert OCR and document structure extraction model.
Extract ALL content from the entire PDF document, broken down by page and then by block. Return valid JSON only.

{
  "total_pages": number,
  "pages": [
    {
      "page_number": 1,
      "blocks": [
        {
          "type": "paragraph" | "list_item" | "table",
          "text": "The exact raw text content for this block, including all original spacing (e.g., 'a  a') and line breaks (\n).",
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Preserve ALL original spacing and internal line breaks (\n) within the 'text' field.
2. For lists, set the "type" to "list_item". Preserve the original bullet, number, or letter (e.g., '1.', 'a.', '- ') in the 'text' field itself.
3. For tables, set the "type" to "table" and format the 'text' value as markdown pipe format. Example: "| Head 1 | Head 2 |\n|---|---|\n| R1C1 | R1C2 |"
4. **LATEX NOTATION MANDATORY**: Convert ALL superscripts and subscripts to LaTeX format:
   • Superscripts: Use ^{} notation - y4→y^{4}, x2→x^{2}, E=mc2→E=mc^{2}
   • Subscripts: Use _{} notation - H2O→H_{2}O, CO2→CO_{2}, a1→a_{1}
   • Examples: y4→y^{4}, CO2→CO_{2}, H2O→H_{2}O, x^3→x^{3}, a_n→a_{n}
5. Only use the block types: "paragraph", "list_item", or "table".
6. Return valid JSON only.
7. Review and correct OCR errors for maximum accuracy.
"""

# --- TOKEN PRICING ---
RATES_PER_MILLION = {
    "gemini-2.5-flash": {"input": 0.35, "output": 1.05}, 
    "gemini-2.5-pro": {"input": 7.00, "output": 21.00},
    "gemini-2.5-flash-lite": {"input": 0.125, "output": 0.375},
}

class EnhancedGeminiConverter:
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-pro"):
        load_dotenv()
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key required.")
        
        self.model_name = model_name
        self.client = genai.Client(api_key=self.api_key)
        self.total_tokens_used = 0
        self.total_cost = 0.0
        
        # Cache setup - production optimized
        self.cache_dir = Path(os.path.dirname(os.path.abspath(__file__))) / "cache"
        self.cache_dir.mkdir(exist_ok=True)
        
        # Rate limiting - optimized for production
        self.last_request_time = 0
        self.min_request_interval = 0.5  # Faster for production

    def rate_limit(self):
        """Optimized rate limiting"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()

    def get_file_hash(self, file_path: str) -> str:
        """Generate hash for file caching"""
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def load_cache(self, file_hash: str) -> Optional[Dict]:
        """Load cached result - optimized"""
        cache_file = self.cache_dir / f"{file_hash}.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return None
        return None

    def save_cache(self, file_hash: str, data: Dict):
        """Save result to cache - optimized"""
        cache_file = self.cache_dir / f"{file_hash}.json"
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception:
            pass  # Silent fail for production

    def _track_usage(self, response):
        """Updates token and cost tracking"""
        if response.usage_metadata:
            prompt_tokens = response.usage_metadata.prompt_token_count
            candidate_tokens = response.usage_metadata.candidates_token_count
            
            rates = RATES_PER_MILLION.get(self.model_name)
            if rates:
                input_cost = (prompt_tokens / 1_000_000) * rates["input"]
                output_cost = (candidate_tokens / 1_000_000) * rates["output"]
                
                self.total_tokens_used += (prompt_tokens + candidate_tokens)
                self.total_cost += (input_cost + output_cost)

    def _convert_to_latex(self, text: str) -> str:
        """Convert superscripts and subscripts to LaTeX notation"""
        # Convert chemical formulas and subscripts: H2O -> H_{2}O, CO2 -> CO_{2}
        text = re.sub(r'([A-Za-z])([0-9]+)([A-Za-z])', 
                     lambda m: f"{m.group(1)}_{{{m.group(2)}}}{m.group(3)}", text)
        
        # Convert standalone subscripts at word end: H2 -> H_{2}
        text = re.sub(r'([A-Za-z])([0-9]+)(?=\s|$|[^a-zA-Z0-9])', 
                     lambda m: f"{m.group(1)}_{{{m.group(2)}}}", text)
        
        # Convert superscripts: y4 -> y^{4}, x2 -> x^{2} (when at end of variable)
        text = re.sub(r'([a-zA-Z])([0-9]+)(?=\s|$|[.,;!?)])', 
                     lambda m: f"{m.group(1)}^{{{m.group(2)}}}", text)
        
        # Handle existing caret notation: x^2 -> x^{2}
        text = re.sub(r'\^([0-9]+)', r'^{\1}', text)
        
        # Handle underscore notation: a_n -> a_{n}
        text = re.sub(r'_([a-zA-Z0-9]+)', r'_{\1}', text)
        
        return text
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Robustly parses JSON from the model's response text."""
        try:
            # Check for markdown code fence and extract JSON if present
            match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if match:
                data = json.loads(match.group(1))
            else:
                # Fallback to assuming the entire text is valid JSON
                data = json.loads(response_text)
            
            # Apply LaTeX conversion to all text content
            self._apply_latex_conversion(data)
            return data
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON from model response. Error: {e}\nResponse:\n{response_text[:500]}...")
    
    def _apply_latex_conversion(self, data: Dict[str, Any]):
        """Recursively apply LaTeX conversion to all text in the JSON data"""
        if isinstance(data, dict):
            for key, value in data.items():
                if key == 'text' and isinstance(value, str):
                    data[key] = self._convert_to_latex(value)
                elif isinstance(value, (dict, list)):
                    self._apply_latex_conversion(value)
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, (dict, list)):
                    self._apply_latex_conversion(item)

    def convert_single(self, pdf_path: str, output_path: str = None, progress_callback: Callable = None, use_cache: bool = True) -> str:
        """Convert single PDF with progress tracking"""
        pdf_path = Path(pdf_path)
        
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        def update_progress(progress: int, message: str):
            if progress_callback:
                progress_callback(progress, message)

        update_progress(5, "Starting conversion...")
        
        # Check cache
        file_hash = self.get_file_hash(str(pdf_path))
        cached = self.load_cache(file_hash) if use_cache else None
        
        if cached and use_cache:
            update_progress(70, "Using cached result...")
            json_data = cached
        else:
            update_progress(10, "Uploading to Gemini...")
            self.rate_limit()
            
            pdf_file = None
            try:
                # Upload with progress
                pdf_file = self.client.files.upload(file=pdf_path)
                update_progress(25, "File uploaded, starting AI processing...")
                
                # Process with AI
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[PROMPT_FULL_DOCUMENT_EXTRACTION, pdf_file],
                    config=genai.types.GenerateContentConfig(temperature=0.0)
                )
                
                update_progress(50, "AI processing complete, parsing results...")
                self._track_usage(response)
                
                # Parse response
                json_data = self._parse_json_response(response.text)
                update_progress(65, "Results parsed, applying formatting...")
                
                # Save cache if enabled
                if use_cache:
                    self.save_cache(file_hash, json_data)
                    update_progress(75, "Results cached...")
                
            finally:
                if pdf_file:
                    try:
                        self.client.files.delete(name=pdf_file.name)
                    except:
                        pass

        update_progress(80, "Creating Word document...")
        
        if not output_path:
            output_path = str(pdf_path.with_suffix('.docx'))
        
        self._save_docx_from_json(json_data, Path(output_path))
        
        update_progress(100, "Completed!")
        return output_path

    def convert_batch(self, pdf_files: List[str], output_dir: str = "outputs", progress_callback: Callable = None) -> List[str]:
        """Convert multiple PDFs with batch progress tracking"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        results = []
        total_files = len(pdf_files)
        
        def batch_progress(file_idx: int, file_progress: int, message: str):
            overall_progress = int((file_idx * 100 + file_progress) / total_files)
            batch_message = f"File {file_idx + 1}/{total_files}: {message}"
            if progress_callback:
                progress_callback(overall_progress, batch_message)
        
        for i, pdf_file in enumerate(pdf_files):
            try:
                pdf_path = Path(pdf_file)
                output_path = output_dir / f"{pdf_path.stem}_converted.docx"
                
                def file_progress(progress: int, message: str):
                    batch_progress(i, progress, message)
                
                result = self.convert_single(str(pdf_path), str(output_path), file_progress, use_cache=True)
                results.append(result)
                
            except Exception as e:
                batch_progress(i, 0, f"Failed: {str(e)}")
                results.append(None)
        
        return results

    def _save_docx_from_json(self, json_data: Dict[str, Any], output_path: Path):
        """Creates a DOCX file from the structured JSON data."""
        doc = Document()
        
        pages = json_data.get("pages", [])
        for i, page in enumerate(pages):
            if i > 0:
                doc.add_page_break()
            
            blocks = page.get("blocks", [])
            for block in blocks:
                self._add_block_to_doc(doc, block)

        doc.save(output_path)

    def _add_block_to_doc(self, doc: Document, block: Dict[str, Any]):
        """Adds a single content block to the document based on its type."""
        block_type = block.get("type", "paragraph").lower()
        text = block.get("text", "").rstrip() 
        
        if not text:
            return

        # Lists
        if block_type == "list_item":
            if re.match(r'^\s*[\-*\•]\s', text):
                para = doc.add_paragraph(style='List Bullet')
            elif re.match(r'^\s*(\d+\.|[a-zA-Z]\.)\s', text):
                para = doc.add_paragraph(style='List Number')
            else:
                para = doc.add_paragraph() 
            self._add_text_with_line_breaks(para, text)

        # Tables
        elif block_type == "table":
            self._add_table_block(doc, text)
            
        # Paragraphs
        else: 
            para = doc.add_paragraph()
            self._add_text_with_line_breaks(para, text)

    def _add_text_with_line_breaks(self, paragraph, text: str):
        """Adds text to a paragraph, preserving internal line breaks."""
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            run = paragraph.add_run(line)
            if i < len(lines) - 1:
                run.add_break()
                
    def _add_table_block(self, doc: Document, table_text: str):
        """Parses markdown table text and adds a table to the document."""
        lines = [line.strip() for line in table_text.strip().split('\n') if line.strip()]
        
        rows_data = []
        for line in lines:
            if all(re.match(r'^[-: ]+$', cell.strip()) for cell in line[1:-1].split('|')):
                continue
            cells = [cell.strip() for cell in line.strip('|').split('|')]
            rows_data.append(cells)
        
        if not rows_data:
            doc.add_paragraph(f"[Unparsed Table Data]:\n{table_text}")
            return
            
        num_cols = max(len(row) for row in rows_data)
        if num_cols == 0: 
            return

        rows_data = [row + [''] * (num_cols - len(row)) for row in rows_data]
        num_rows = len(rows_data)
        
        table = doc.add_table(rows=num_rows, cols=num_cols)
        table.style = 'Table Grid'
        
        for i, row_cells in enumerate(rows_data):
            for j, cell_text in enumerate(row_cells):
                cell = table.cell(i, j)
                para = cell.paragraphs[0] if cell.paragraphs else cell.add_paragraph()
                para.clear()
                self._add_text_with_line_breaks(para, cell_text)
                
        # Bold header row
        if num_rows > 0:
            for cell in table.rows[0].cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True

    def get_usage_stats(self) -> Dict[str, Any]:
        """Returns statistics on API usage and cost."""
        return {
            "total_tokens": self.total_tokens_used,
            "estimated_cost": self.total_cost,
            "cache_files": len(list(self.cache_dir.glob("*.json"))) if self.cache_dir.exists() else 0
        }

    def extract_text_for_preview(self, json_data: Dict[str, Any]) -> str:
        """Extract plain text from JSON data for preview"""
        text_parts = []
        pages = json_data.get("pages", [])
        
        for page in pages:
            page_num = page.get("page_number", 1)
            text_parts.append(f"=== Page {page_num} ===\n")
            
            blocks = page.get("blocks", [])
            for block in blocks:
                text = block.get("text", "").strip()
                if text:
                    text_parts.append(text + "\n")
            text_parts.append("\n")
        
        return "".join(text_parts)

    def get_pages_data(self, json_data: Dict[str, Any]) -> List[Dict]:
        """Extract pages data for frontend"""
        pages_data = []
        pages = json_data.get("pages", [])
        
        for page in pages:
            page_num = page.get("page_number", 1)
            blocks = page.get("blocks", [])
            
            content_parts = []
            for block in blocks:
                text = block.get("text", "").strip()
                if text:
                    # Preserve block structure for better formatting
                    block_type = block.get("type", "paragraph")
                    if block_type == "list_item":
                        # Ensure list items have proper formatting
                        import re
                        if not text.startswith(('• ', '- ', '* ')) and not re.match(r'^\d+\.', text):
                            text = f"• {text}"
                    content_parts.append(text)
            
            pages_data.append({
                "page_number": page_num,
                "content": "\n\n".join(content_parts) if content_parts else ""
            })
        
        return pages_data