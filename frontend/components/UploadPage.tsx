import { useState, useRef } from 'react';
import { Upload, FileText, Clock, Zap, Sparkles, Shield, Layers, HelpCircle, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type UploadPageProps = {
  onFilesUploaded: (files: File[], isBatch: boolean, useCache?: boolean) => void;
  onViewStored: () => void;
  hasStoredFiles: boolean;
};

export function UploadPage({ onFilesUploaded, onViewStored, hasStoredFiles }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    try {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === 'application/pdf'
      );

      if (droppedFiles.length > 0) {
        onFilesUploaded(droppedFiles, droppedFiles.length > 1, useCache);
      } else {
        // Show user feedback for invalid files
        console.warn('No valid PDF files found in drop');
      }
    } catch (error) {
      console.error('Error handling dropped files:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isBatch: boolean) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      console.log(`🎯 UploadPage: useCache=${useCache}, isBatch=${isBatch}`);
      onFilesUploaded(selectedFiles, isBatch, useCache);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with glassmorphism */}
      <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 animate-slide-up min-w-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl transition-all flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
              </div>
              <div className="min-w-0">
                <h1 className="text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text truncate">
                  PDF Text Extractor
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">
                  Professional OCR & Text Extraction Platform
                </p>
              </div>
            </div>
            {hasStoredFiles && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewStored}
                className="group hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex-shrink-0"
              >
                <Clock className="w-4 h-4 sm:mr-2 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">View Stored Files</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span className="text-indigo-700 text-xs sm:text-sm">AI-Powered Text Extraction</span>
            </div>
            <h2 className="text-slate-900 mb-3 sm:mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text px-4">
              Extract Text from PDFs with Precision
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4">
              Upload your PDF documents and get accurate text extraction with advanced editing
              capabilities. Process single files or handle batch operations with ease.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 transition-all duration-300 animate-scale-in group ${
              isDragging
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-xl shadow-indigo-200/50 scale-[1.02]'
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50/30 hover:shadow-lg'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-2xl sm:rounded-3xl blur-2xl"></div>
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-indigo-600 relative z-10 group-hover:-translate-y-1 transition-transform duration-500" />
              </div>

              <h3 className="text-slate-900 mb-2 px-4">Drop your PDF files here</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                or click to browse from your computer
              </p>

              {/* Cache Option */}
              <TooltipProvider>
                <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Use Cache</span>
                  </div>
                  <Switch
                    checked={useCache}
                    onCheckedChange={setUseCache}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Smart Caching System</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Enabled:</strong> Uses previously processed results for identical files, providing instant results and saving processing time.
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Disabled:</strong> Always performs fresh OCR processing, ensuring the latest AI improvements are applied.
                        </p>
                        <div className="pt-1 border-t border-slate-200">
                          <p className="text-xs text-emerald-600 font-medium">💡 Recommended: Keep enabled for faster processing</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all group/btn"
                      >
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        <Upload className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                        Upload Single File
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Upload a single PDF file for processing</p>
                      <p className="text-xs text-slate-500 mt-1">Redirects immediately to processing page with real-time progress</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => batchInputRef.current?.click()}
                        className="group/btn border-2 hover:border-indigo-500 hover:bg-indigo-50 hover:scale-105 transition-all"
                      >
                        <Zap className="w-4 h-4 mr-2 group-hover/btn:text-indigo-600 transition-colors" />
                        Batch Upload
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Upload multiple PDF files at once</p>
                      <p className="text-xs text-slate-500 mt-1">Process up to 10 files simultaneously with batch progress tracking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileSelect(e, false)}
                className="hidden"
              />
              <input
                ref={batchInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => handleFileSelect(e, true)}
                className="hidden"
              />

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-500 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Secure</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-400 hidden sm:block"></div>
                <div>PDF Format</div>
                <div className="w-1 h-1 rounded-full bg-slate-400 hidden sm:block"></div>
                <div>Max 50MB</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Card className="p-5 sm:p-6 border-slate-200/60 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 group bg-gradient-to-br from-white to-slate-50/50 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <FileText className="w-7 h-7 text-emerald-600 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <h3 className="text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                Accurate Extraction
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Advanced OCR technology ensures precise text extraction from any PDF document with
                99.9% accuracy.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 border-slate-200/60 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 group bg-gradient-to-br from-white to-slate-50/50 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Zap className="w-7 h-7 text-purple-600 group-hover:-translate-y-1 transition-transform duration-500" />
              </div>
              <h3 className="text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                Batch Processing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Process multiple PDFs simultaneously and manage them all in one intuitive
                dashboard.
              </p>
            </Card>

            <Card className="p-5 sm:p-6 border-slate-200/60 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-500 group bg-gradient-to-br from-white to-slate-50/50 hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Clock className="w-7 h-7 text-amber-600 group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <h3 className="text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                2-Day Storage
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your processed files are securely stored for 2 days for easy access and multiple
                exports.
              </p>
            </Card>
          </div>

          {/* Additional Features Banner */}
          <div
            className="mt-8 sm:mt-12 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white shadow-2xl shadow-indigo-500/30 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2">Advanced Features</h3>
                <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
                  Side-by-side comparison, AI-powered corrections, multiple export formats, and
                  real-time text editing — all in one powerful platform.
                </p>
              </div>
              <div className="flex-shrink-0 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full md:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/50 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-slate-600 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Enterprise-grade Security</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-400"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>2-Day Secure Storage</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-400"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
