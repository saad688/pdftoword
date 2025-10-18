# 🔧 Troubleshooting Guide

## ✅ Fixed: Environment Variables Error

If you see: `TypeError: Cannot read properties of undefined (reading 'VITE_API_URL')`

**This has been fixed!** The app now has safe fallbacks for all environment variables.

---

## 🚀 Quick Fixes

### 1. **Clear Cache and Restart**

```bash
# Stop the dev server (Ctrl+C)

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### 2. **Verify .env File Exists**

Check that `.env` file is in the root directory:

```bash
# Should show the .env file
ls -la | grep .env
```

If missing, it should have been created automatically. Contents:
```env
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=60000
VITE_ENABLE_AI_CORRECTION=true
VITE_MAX_FILE_SIZE=52428800
VITE_POLLING_INTERVAL=2000
```

### 3. **Restart Vite Dev Server**

Sometimes Vite needs a fresh restart to pick up environment variables:

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## 🐛 Common Errors & Solutions

### Error: `import.meta is undefined`

**Solution:** This is now fixed with safe fallback handling. If you still see it:

1. Make sure you're using Vite (not webpack)
2. Clear `.vite` cache folder: `rm -rf node_modules/.vite`
3. Restart dev server

### Error: `Module not found: axios`

**Solution:**
```bash
npm install axios
```

### Error: `Cannot find module '../config/env'`

**Solution:** The `config` folder should be created automatically. If not:

```bash
mkdir -p config
```

Then copy the `env.ts` file content from the documentation.

### Error: Backend not responding

**Solution:**

1. Check backend is running:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. If not running, start it:
   ```bash
   cd backend
   python main.py
   ```

3. Check for CORS errors in browser console

### Error: CORS policy blocking requests

**Solution:** Update `backend/main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔍 Debugging Steps

### 1. Check Environment Variables

In your browser console (after page loads):

```javascript
// This won't work directly, but check the Network tab
// Look for API calls to see what URL is being used
```

### 2. Check API Endpoint

Open browser and navigate to:
```
http://localhost:8000/api/health
```

Should return:
```json
{"status":"healthy","timestamp":"2025-..."}
```

### 3. Check Browser Console

Open DevTools (F12) → Console tab
Look for:
- ❌ Red errors
- ⚠️ Yellow warnings
- Network errors

### 4. Check Network Tab

Open DevTools (F12) → Network tab
Look for:
- API calls to `/api/...`
- Status codes (200 = success, 404 = not found, 500 = server error)
- CORS errors

---

## 📁 File Structure Verification

Make sure you have these files:

```
Frontend Root/
├── .env                    ✅ Environment variables
├── config/
│   └── env.ts             ✅ Config with fallbacks
├── services/
│   └── api.ts             ✅ API service
├── hooks/
│   └── useFilePolling.ts  ✅ Polling hook
├── vite-env.d.ts          ✅ TypeScript definitions
├── vite.config.ts         ✅ Vite configuration
└── package.json           ✅ Dependencies
```

### Check Files Exist

```bash
ls -la .env config/env.ts services/api.ts hooks/useFilePolling.ts vite-env.d.ts
```

All should exist. If any are missing, refer to the documentation to recreate them.

---

## 🔄 Full Reset (Nuclear Option)

If nothing else works:

```bash
# 1. Stop all servers
# Press Ctrl+C in both terminals

# 2. Clean everything
rm -rf node_modules package-lock.json .vite

# 3. Reinstall
npm install

# 4. Restart backend
cd backend
python main.py

# 5. Restart frontend (new terminal)
npm run dev
```

---

## ✅ Verification Checklist

After fixes, verify:

- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:5173
- [ ] No red banner "Backend not connected"
- [ ] Console has no errors
- [ ] Backend running at http://localhost:8000
- [ ] Health check works: http://localhost:8000/api/health

---

## 🆘 Still Having Issues?

### Check These:

1. **Node.js version**
   ```bash
   node --version  # Should be 18+
   ```

2. **Python version**
   ```bash
   python --version  # Should be 3.8+
   ```

3. **Ports available**
   ```bash
   # Check if ports are in use
   lsof -i :5173  # Frontend
   lsof -i :8000  # Backend
   ```

4. **Firewall**
   - Allow connections to localhost:5173 and localhost:8000

---

## 📞 Get Help

1. Check error messages in:
   - Browser console (F12)
   - Terminal running frontend
   - Terminal running backend

2. Search error message in documentation

3. Check `BACKEND_INTEGRATION.md` for detailed setup

---

## 🎯 Most Common Issues (Quick Reference)

| Issue | Quick Fix |
|-------|-----------|
| Environment error | Restart dev server |
| Module not found | `npm install` |
| Backend not responding | Start backend: `python main.py` |
| CORS error | Check backend CORS settings |
| Port in use | Kill process or use different port |
| Upload fails | Check GEMINI_API_KEY in backend |

---

**💡 Tip:** Most issues are fixed by stopping both servers, running `npm install`, and starting both servers again.
