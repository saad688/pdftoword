# 🚀 Setup Instructions

Follow these simple steps to get the application running:

## Step 1: Install Node.js

Make sure you have **Node.js 18 or higher** installed.

Check your version:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

## Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

**Wait 2-5 minutes** for all packages to install.

## Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.2  ready in 500 ms

➜  Local:   http://localhost:5173/
```

## Step 4: Open in Browser

The application will automatically open at:
```
http://localhost:5173/
```

If it doesn't open automatically, click the link or manually navigate to it.

## ✅ Verification

You should see:
- ✅ Upload page with drag-and-drop area
- ✅ Professional design with glassmorphism effects
- ✅ Smooth animations
- ✅ No console errors

## 🎯 Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🐛 Common Issues

### Issue: Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Issue: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission errors (Mac/Linux)
```bash
sudo npm install
```

## 📦 What Gets Installed?

- React 18.3.1 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS 4 - Styling
- Radix UI - Component library
- Lucide React - Icons
- And more... (~300MB total)

## 🎉 You're Ready!

Once the server is running, you can:
1. Upload PDF files (drag & drop or click to browse)
2. Process single or batch files
3. Edit extracted text
4. Export to multiple formats
5. Explore all features!

---

**Need help?** Check the main README.md or create an issue.
