# 📄 PDF Text Extractor - Professional OCR Platform

A modern, professional PDF text extraction platform built with React, TypeScript, and Tailwind CSS. Features AI-powered text correction, batch processing, and multiple export formats.

![Platform Preview](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎯 **Advanced OCR** - Extract text from PDFs with high accuracy
- 📝 **Rich Text Editor** - Edit extracted text with formatting options
- ⚡ **Batch Processing** - Process multiple files simultaneously
- 🤖 **AI-Powered Correction** - Intelligent text correction suggestions
- 💾 **Multiple Export Formats** - DOCX, PDF, TXT, HTML, MD, RTF
- 📊 **Real-time Statistics** - Word count, character count, line count
- 🔄 **Undo/Redo** - Full history tracking with keyboard shortcuts
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Glass morphism effects, smooth animations
- ⏰ **2-Day Storage** - Automatic file management

## 🚀 Quick Start

> **✨ NEW: All setup files have been created! Just install and run!**

### **👉 Read [START_HERE.md](START_HERE.md) for the complete 3-step setup guide!**

Or follow these quick steps:

### Prerequisites

- Node.js 18+ installed
- Python 3.8+ installed
- Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Setup backend** (in parent directory)
   ```bash
   cd ..
   echo "GEMINI_API_KEY=your_key_here" > .env
   pip install fastapi uvicorn python-multipart aiofiles python-dotenv google-generativeai python-docx
   ```

3. **Start backend**
   ```bash
   cd backend
   python main.py
   ```

4. **Start frontend** (new terminal)
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

The application will automatically open and connect to the backend!

> 📚 **Detailed guides:** See [START_HERE.md](START_HERE.md) or [QUICK_START.md](QUICK_START.md)

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload enabled) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

## 🏗️ Project Structure

```
pdf-text-extractor/
├── src/                    # Source files
│   └── main.tsx           # Application entry point
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── UploadPage.tsx    # File upload interface
│   ├── EditorPage.tsx    # Text editor view
│   ├── BatchProcessingPage.tsx
│   ├── StoredFilesPage.tsx
│   ├── TextEditor.tsx    # Rich text editor
│   ├── ExportDialog.tsx  # Export functionality
│   └── CorrectionDialog.tsx
├── styles/
│   └── globals.css       # Global styles + Tailwind
├── App.tsx               # Main app component
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies

```

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| **[START_HERE.md](START_HERE.md)** | 🌟 **Start here!** Complete 3-step setup guide |
| **[QUICK_START.md](QUICK_START.md)** | ⚡ Quick reference for getting started |
| **[ERROR_FIX_SUMMARY.md](ERROR_FIX_SUMMARY.md)** | ✅ Environment variable error fix details |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | 🔧 Common issues and solutions |
| **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** | 🔗 Complete backend integration guide |
| **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** | 📝 All changes made for backend integration |

## 🎨 Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI (Python)
- **OCR Engine**: Google Gemini API
- **Document Processing**: python-docx
- **File Storage**: Local filesystem

## 🔧 Configuration

### Environment Variables

A `.env` file has been auto-created with these defaults:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=60000

# Feature Flags
VITE_ENABLE_AI_CORRECTION=true
VITE_MAX_FILE_SIZE=52428800

# Polling interval (milliseconds)
VITE_POLLING_INTERVAL=2000
```

**Note:** The app has built-in fallbacks, so it works even without a `.env` file!

### Tailwind Configuration

The project uses Tailwind CSS 4.0 with custom design tokens in `styles/globals.css`.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features Explained

### Text Editor
- **Markdown Support**: Bold (\*\*text\*\*), Italic (\*text\*), Underline (\_\_text\_\_)
- **Keyboard Shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
- **Undo/Redo**: Ctrl+Z, Ctrl+Y with full history
- **Auto-save**: Changes saved automatically

### Export Formats
- **TXT**: Plain text (markdown removed)
- **HTML**: Fully formatted with CSS
- **DOCX**: Microsoft Word format (requires backend)
- **PDF**: Portable Document Format (requires backend)
- **MD**: Markdown format preserved
- **RTF**: Rich Text Format (requires backend)

### Batch Processing
- Upload multiple files at once
- Individual or bulk export
- Track processing status for each file
- Search and filter capabilities

## 🚢 Production Build

Build optimized production files:

```bash
npm run build
```

Output will be in the `dist/` folder. Deploy to:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Configure in repository settings
- **Any static hosting**: Upload `dist/` contents

## 🔮 Backend Integration

This is currently a **frontend-only** application with simulated data. To connect to a real backend:

1. Update API endpoints in your components
2. Replace mock data with actual API calls
3. Implement authentication if needed
4. Configure CORS on your backend

See `/guidelines/Guidelines.md` for backend architecture recommendations.

## 🐛 Troubleshooting

**Port already in use:**
```bash
npm run dev -- --port 3000
```

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
npm install -D typescript@latest
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
