# ⚡ Quick Reference Card

## 🚀 Installation (One Time)

```bash
# Frontend
npm install

# Backend (in parent directory)
cd ..
pip install fastapi uvicorn python-multipart aiofiles python-dotenv google-generativeai python-docx
echo "GEMINI_API_KEY=your_key_here" > .env
```

---

## 🏃 Running the App (Every Time)

### Terminal 1 - Backend
```bash
cd backend
python main.py
```
**Runs on:** http://localhost:8000

### Terminal 2 - Frontend  
```bash
npm run dev
```
**Runs on:** http://localhost:5173

---

## 🎯 Key Commands

| Action | Command |
|--------|---------|
| **Install** | `npm install` |
| **Start Frontend** | `npm run dev` |
| **Start Backend** | `cd backend && python main.py` |
| **Build for Production** | `npm run build` |
| **Preview Build** | `npm run preview` |
| **Check Backend Health** | `curl http://localhost:8000/api/health` |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/.env` | Frontend environment config |
| `/../.env` | Backend API key (GEMINI_API_KEY) |
| `/config/env.ts` | Centralized config with fallbacks |
| `/services/api.ts` | All API calls |
| `/App.tsx` | Main application |

---

## 🔧 Common Fixes

### Backend Not Connected
```bash
cd backend
python main.py
```

### Frontend Error
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Clear Cache
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

---

## 📊 Default Configuration

```
API URL: http://localhost:8000/api
Timeout: 60 seconds
Max File Size: 50MB
Polling Interval: 2 seconds
Storage Duration: 2 days
```

---

## ⌨️ Keyboard Shortcuts (In Editor)

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy |

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload single PDF |
| `POST` | `/api/upload-batch` | Upload multiple PDFs |
| `GET` | `/api/files/{id}` | Get file status |
| `GET` | `/api/files` | List all files |
| `PUT` | `/api/files/{id}/text` | Update text |
| `GET` | `/api/files/{id}/download` | Download DOCX |
| `DELETE` | `/api/files/{id}` | Delete file |

---

## ✅ Quick Test

```bash
# 1. Check backend is running
curl http://localhost:8000/api/health

# 2. Check frontend is running
# Open http://localhost:5173 in browser

# 3. Upload a test PDF
# Drag and drop a PDF file

# 4. Verify processing works
# Watch progress bar update

# 5. Download result
# Click "Download DOCX" button
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Environment error | Restart dev server |
| Module not found | `npm install` |
| Backend not responding | `cd backend && python main.py` |
| CORS error | Check backend CORS settings |
| Upload fails | Check GEMINI_API_KEY in backend .env |

---

## 📚 Full Documentation

- **[START_HERE.md](START_HERE.md)** - Complete setup guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Detailed troubleshooting
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Integration guide

---

## 🎯 Project Structure

```
Main Directory/
├── .env                    # GEMINI_API_KEY
├── gemini_files_converter.py
├── backend/
│   └── main.py            # Backend server
└── frontend/
    ├── .env               # Frontend config
    ├── App.tsx            # Main app
    ├── components/        # UI components
    ├── services/          # API client
    ├── hooks/             # Custom hooks
    └── config/            # Configuration
```

---

## 💡 Pro Tips

1. Keep **both terminals open** to see logs
2. Check **browser console** (F12) for errors
3. Use **small PDFs** (1-2 pages) for testing
4. **Restart both servers** if something breaks
5. Check **both .env files** are configured

---

## 🔐 Security Notes

- Never commit `.env` files with real API keys to Git
- Use `.env.local` for local development secrets
- Set environment variables on hosting platforms
- Rotate API keys regularly

---

## 🚢 Deployment Checklist

### Frontend
- [ ] Run `npm run build`
- [ ] Update `.env` with production API URL
- [ ] Deploy `dist/` folder
- [ ] Test on production URL

### Backend
- [ ] Set `GEMINI_API_KEY` on server
- [ ] Update CORS to include frontend URL
- [ ] Deploy backend code
- [ ] Test API health endpoint

---

**🎉 Keep this file handy for quick reference!**
