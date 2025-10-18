# ⚡ Quick Start - 3 Simple Steps

Get your PDF Text Extractor up and running in **under 5 minutes**!

---

## 🎯 Prerequisites

- ✅ Node.js 18+ installed
- ✅ Python 3.8+ installed
- ✅ Gemini API key (get from: https://aistudio.google.com/apikey)

---

## 🚀 Step 1: Install Frontend Dependencies

```bash
# You're already in the frontend directory
npm install
```

**Wait 2-5 minutes** for packages to install.

---

## 🐍 Step 2: Setup & Start Backend

### A. Install Python Dependencies

```bash
cd ..  # Go to main directory
pip install fastapi uvicorn python-multipart aiofiles python-dotenv google-generativeai python-docx
```

### B. Create `.env` File (in main directory)

```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

**Replace `your_actual_api_key_here` with your real Gemini API key!**

### C. Start Backend Server

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**✅ Keep this terminal open!**

---

## 🎨 Step 3: Start Frontend

Open a **NEW terminal** in the frontend directory:

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**✅ Browser opens automatically!**

---

## 🎉 You're Ready!

Your app is now running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

### Try It Out:

1. 📤 **Drag & drop** a PDF file
2. ⏳ **Watch** it process in real-time
3. ✏️ **Edit** the extracted text
4. 📥 **Download** as DOCX

---

## 🔍 Verify Everything Works

### Test 1: Check Backend
```bash
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy","timestamp":"..."}`

### Test 2: Check Frontend
Open http://localhost:5173 - you should see:
- ✅ Professional upload page
- ✅ No red error banner
- ✅ Smooth animations

### Test 3: Upload a PDF
- Drag a PDF onto the upload area
- Should see "Processing your PDF..."
- Progress bar should update
- Text should appear when done

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Install dependencies again
pip install -r requirements.txt  # If you have one
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Backend not connected" banner
1. Check backend terminal - should show "Uvicorn running"
2. Check http://localhost:8000/api/health in browser
3. Check firewall isn't blocking port 8000

### Upload fails
1. Check GEMINI_API_KEY is set in `.env`
2. Check PDF file is < 50MB
3. Check backend terminal for error messages

---

## 📚 Full Documentation

- `BACKEND_INTEGRATION.md` - Complete integration guide
- `CHANGES_SUMMARY.md` - All changes made
- `README.md` - Project documentation
- `SETUP.md` - Detailed setup guide

---

## 🎓 File Structure

```
Main Directory/
├── .env                          ← GEMINI_API_KEY here
├── gemini_files_converter.py
├── backend/
│   └── main.py                   ← Start with: python main.py
└── frontend/                     ← You are here
    ├── .env                      ← API URL config
    ├── package.json
    ├── npm run dev               ← Start frontend
    └── ... (React app files)
```

---

## ⚙️ Configuration

### Change Backend Port

Edit `backend/main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Change 8000
```

Then update frontend `.env`:
```env
VITE_API_URL=http://localhost:8000/api  # Match port
```

### Change Polling Speed

Edit frontend `.env`:
```env
VITE_POLLING_INTERVAL=2000  # Milliseconds (2 seconds)
```

---

## 🚢 Production Deployment

### Quick Deploy Frontend
```bash
npm run build
# Upload 'dist/' folder to Vercel/Netlify
```

### Quick Deploy Backend
```bash
# Deploy to Railway/Heroku/DigitalOcean
# Set GEMINI_API_KEY environment variable
# Update frontend .env with production URL
```

---

## 💡 Tips

1. **Keep both terminals open** while developing
2. **Frontend auto-reloads** on file changes
3. **Backend auto-reloads** with `reload=True` in uvicorn
4. **Check browser console** for errors
5. **Check backend terminal** for API errors

---

## 🎯 Common Commands

```bash
# Frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build

# Backend (in backend folder)
python main.py   # Start server
```

---

## ✅ Success Indicators

You're good to go if you see:

- ✅ Both terminals running without errors
- ✅ Frontend opens in browser automatically
- ✅ No red error banner at top
- ✅ Upload area accepts PDF files
- ✅ Progress bar animates during processing
- ✅ Extracted text appears in editor
- ✅ Download DOCX button works

---

**🎉 That's it! Start uploading PDFs and extracting text!**

For detailed documentation, see `BACKEND_INTEGRATION.md`
