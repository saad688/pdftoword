# 🚀 START HERE - Complete Setup Guide

Welcome! This document will get you up and running in **3 simple steps**.

---

## ✅ Everything is Ready!

All configuration files have been created and the environment variable error has been fixed. You just need to install and run!

---

## 📋 Quick Start (3 Steps)

### **Step 1: Install Dependencies** ⚙️

```bash
npm install
```

Wait 2-5 minutes for installation to complete.

---

### **Step 2: Setup & Start Backend** 🐍

```bash
# Go to parent directory
cd ..

# Install Python dependencies
pip install fastapi uvicorn python-multipart aiofiles python-dotenv google-generativeai python-docx

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env

# Start backend
cd backend
python main.py
```

**✅ Keep this terminal open!**

Backend will run on: http://localhost:8000

---

### **Step 3: Start Frontend** 🎨

Open a **new terminal** in the frontend directory:

```bash
npm run dev
```

**✅ Browser opens automatically!**

Frontend will run on: http://localhost:5173

---

## 🎉 You're Done!

Both servers are running. Now you can:

1. 📤 **Upload a PDF** - Drag & drop or click to browse
2. ⏳ **Watch it process** - Real-time progress updates
3. ✏️ **Edit the text** - Full text editor with formatting
4. 📥 **Download DOCX** - Get your converted document

---

## 📁 What Was Fixed

### ✅ **Environment Variable Error - SOLVED**

The error `Cannot read properties of undefined (reading 'VITE_API_URL')` has been fixed with:

1. **Safe environment variable handling**
2. **Centralized configuration system** (`/config/env.ts`)
3. **TypeScript type definitions** (`/vite-env.d.ts`)
4. **Guaranteed fallback values**

### ✅ **New Files Created**

| File | Purpose |
|------|---------|
| `/.env` | Environment configuration |
| `/config/env.ts` | Centralized config with fallbacks |
| `/vite-env.d.ts` | TypeScript definitions |
| `/services/api.ts` | API service (updated) |
| `/hooks/useFilePolling.ts` | Real-time polling |
| `/.gitignore` | Git ignore rules |
| `/TROUBLESHOOTING.md` | Help guide |
| `/ERROR_FIX_SUMMARY.md` | Fix details |

---

## 🔍 Verify Everything Works

### ✅ **Backend Health Check**

```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{"status":"healthy","timestamp":"2025-..."}
```

### ✅ **Frontend Loads**

Open http://localhost:5173 in browser:
- ✅ No errors in console (F12)
- ✅ No red banner at top
- ✅ Upload page displays correctly

---

## 📚 Documentation Guide

| Document | Use When |
|----------|----------|
| **START_HERE.md** | First time setup (you are here!) |
| **QUICK_START.md** | Quick 3-step guide |
| **ERROR_FIX_SUMMARY.md** | Understanding the fix |
| **TROUBLESHOOTING.md** | Having issues |
| **BACKEND_INTEGRATION.md** | Detailed integration guide |
| **CHANGES_SUMMARY.md** | See all changes made |
| **README.md** | Project overview |

---

## ⚙️ Default Configuration

The app uses these defaults (can be changed in `.env`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=60000
VITE_ENABLE_AI_CORRECTION=true
VITE_MAX_FILE_SIZE=52428800
VITE_POLLING_INTERVAL=2000
```

**The app works without a `.env` file!** Fallbacks are built-in.

---

## 🎯 Features You Get

### ✅ **PDF Text Extraction**
- Drag & drop or click to upload
- Real-time processing with Gemini API
- Accurate text extraction with formatting

### ✅ **Text Editor**
- Rich text editing (bold, italic, underline)
- Undo/Redo with Ctrl+Z / Ctrl+Y
- Real-time word/character/line counts
- Auto-save to backend

### ✅ **Download DOCX**
- One-click download
- Preserves formatting
- Converted with python-docx

### ✅ **Batch Processing**
- Upload multiple PDFs at once
- Individual or bulk export
- Track each file's progress

### ✅ **File Management**
- 2-day automatic storage
- Search and filter files
- Delete unwanted files

### ✅ **Responsive Design**
- Works on mobile, tablet, desktop
- Smooth animations
- Professional UI with glassmorphism

---

## 🐛 Common Issues

### **"Backend not connected" banner**

**Fix:** Start the backend server
```bash
cd backend
python main.py
```

### **Upload fails**

**Fix:** Check GEMINI_API_KEY is set in parent `.env` file

### **Module not found**

**Fix:** Install dependencies
```bash
npm install
```

### **Port already in use**

**Fix:** Use different port
```bash
npm run dev -- --port 3000
```

---

## 🔧 Advanced Configuration

### **Change Backend URL**

Edit frontend `.env`:
```env
VITE_API_URL=http://your-backend.com/api
```

### **Change Polling Speed**

Edit frontend `.env`:
```env
VITE_POLLING_INTERVAL=5000  # Poll every 5 seconds
```

### **Enable Debug Mode**

Open browser console (F12) and watch:
- Network tab for API calls
- Console tab for logs

---

## 📊 Project Structure

```
Main Directory/
├── .env                    ← GEMINI_API_KEY
├── gemini_files_converter.py
├── backend/
│   └── main.py            ← Backend server
│
└── frontend/              ← You are here!
    ├── .env               ← Frontend config (auto-created)
    ├── config/
    │   └── env.ts         ← Safe config (auto-created)
    ├── services/
    │   └── api.ts         ← API client (auto-created)
    ├── hooks/
    │   └── useFilePolling.ts
    ├── components/        ← React components
    ├── App.tsx            ← Main app
    └── package.json       ← Dependencies
```

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check returns success
- [ ] Upload page loads correctly
- [ ] Can upload a PDF file
- [ ] Progress bar shows updates
- [ ] Text extraction completes
- [ ] Can edit extracted text
- [ ] Download DOCX button works
- [ ] DOCX file downloads correctly

---

## 🚢 Production Deployment

### **Frontend**
```bash
npm run build
# Deploy 'dist/' folder to Vercel/Netlify/etc.
```

Update `.env` for production:
```env
VITE_API_URL=https://your-backend-api.com/api
```

### **Backend**

Deploy to Railway/Heroku/AWS:
1. Set `GEMINI_API_KEY` environment variable
2. Update CORS to include your frontend URL
3. Deploy `backend/` folder

---

## 💡 Pro Tips

1. **Keep both terminals visible** to see logs
2. **Check browser console** for frontend errors
3. **Check backend terminal** for API errors
4. **Test with small PDFs first** (1-2 pages)
5. **Use Ctrl+Z / Ctrl+Y** for undo/redo in editor

---

## 🆘 Need Help?

1. **Check error messages** in console/terminal
2. **Read TROUBLESHOOTING.md** for solutions
3. **Verify both servers are running**
4. **Check GEMINI_API_KEY is set**

---

## 🎓 Next Steps

After everything works:

1. ✅ Upload a test PDF
2. ✅ Edit the extracted text
3. ✅ Download as DOCX
4. ✅ Try batch processing
5. ✅ Explore all features!

---

## 🎉 You're All Set!

Everything is configured and ready. Just run:

```bash
# Terminal 1 (backend)
cd backend && python main.py

# Terminal 2 (frontend)
npm run dev
```

**Happy PDF extracting!** 🚀

---

## 📞 Quick Reference

| What | Command |
|------|---------|
| Install | `npm install` |
| Start Frontend | `npm run dev` |
| Start Backend | `cd backend && python main.py` |
| Build Production | `npm run build` |
| Health Check | `curl http://localhost:8000/api/health` |

---

**💡 Remember:** Both servers must run simultaneously for the app to work!
