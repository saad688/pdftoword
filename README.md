# PDF to Word Converter API

Professional PDF to Word conversion service powered by Google Gemini AI with comprehensive logging and cost tracking.

## Features

- **AI-Powered Conversion**: Uses Google Gemini 2.5 Pro for accurate text extraction
- **LaTeX Notation**: Converts superscripts/subscripts to LaTeX format (y4 → y^{4}, CO2 → CO_{2})
- **Professional Logging**: Detailed request/response logging with daily/monthly organization
- **Cost Tracking**: Comprehensive API usage and cost monitoring
- **Real-time Progress**: Live progress updates during processing
- **Caching System**: Optional caching for faster repeated processing
- **Production Ready**: Containerized with Docker, deployable to Render/Heroku

## Quick Start

### Local Development

1. **Clone and Setup**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pdf-to-word-converter.git
   cd pdf-to-word-converter
   pip install -r requirements.txt
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

3. **Get Gemini API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add it to your `.env` file

4. **Run Backend**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

5. **Run Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Deployment

```bash
docker build -t pdf-to-word-api .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key pdf-to-word-api
```

### Render Deployment

1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set `GEMINI_API_KEY` in environment variables

## API Endpoints

- `POST /api/upload` - Upload PDF file
- `GET /api/files/{file_id}` - Get processing status
- `GET /api/files/{file_id}/download` - Download converted file
- `GET /api/health` - Health check

## Logging Structure

```
logs/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── api_09.log
│   │   │   └── api_10.log

cost_tracking/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── costs_09.json
│   │   │   └── daily_summary.json
│   │   └── monthly_summary.json
```

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `DEBUG` - Enable debug mode (default: false)
- `PORT` - Server port (default: 8000)
- `ENABLE_CACHE` - Enable caching system (default: true)

## Cost Tracking

The system automatically tracks:
- API usage and costs in `cost_tracking/` directory
- Daily and monthly summaries
- Per-file processing costs
- AI correction costs

## Logging

Detailed logs are stored in `logs/` directory:
- Ultra-detailed request/response logging
- System metrics and performance data
- Error tracking and debugging info

## License

MIT License