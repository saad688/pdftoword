import { useState } from 'react';
import { ProcessedFile } from '../App';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileText,
  Columns2,
  Eye,
  Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { TextEditor } from './TextEditor';
import { PagedPDFViewer } from './PagedPDFViewer';
import { ExportDialog } from './ExportDialog';
import { CorrectionDialog } from './CorrectionDialog';
import { Badge } from './ui/badge';


type EditorPageProps = {
  file: ProcessedFile;
  onUpdateText: (fileId: string, newText: string) => void;
  onBack: () => void;
  onDownload?: (fileId: string) => void;
};

export function EditorPage({
  file,
  onUpdateText,
  onBack,
  onDownload,
}: EditorPageProps) {
  const [viewMode, setViewMode] = useState<'editor' | 'sideBySide'>('editor');
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.extractedText);
      setCopied(true);
      toast.success('Text copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = file.extractedText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          toast.success('Text copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (fallbackError) {
        console.error('Copy failed:', fallbackError);
        toast.error('Failed to copy text - please select and copy manually');
      }
    }
  };

  const handleTextChange = (newText: string) => {
    onUpdateText(file.id, newText);
  };

  const handleRequestCorrection = (selectedText: string, correction: string) => {
    const newText = file.extractedText.replace(selectedText, correction);
    onUpdateText(file.id, newText);
    toast.success('Text corrected successfully', {
      description: 'Your changes have been applied',
    });
  };

  const timeRemaining = () => {
    const now = new Date();
    const expiry = new Date(file.expiryDate);
    const hoursLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    if (daysLeft > 0) return `${daysLeft}d ${hoursLeft % 24}h`;
    return `${hoursLeft}h`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/30">
      {/* Header - Fixed z-index issue */}
      <header className="glass border-b border-white/60 bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm animate-slide-up">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="group hover:bg-slate-100 hover:scale-105 transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden sm:block" />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-lg sm:rounded-xl blur-lg opacity-50"></div>
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white relative z-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-slate-900 text-sm sm:text-base truncate" title={file.name}>
                      {file.name}
                    </h1>
                    {file.status === 'completed' && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 shadow-sm"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {file.status === 'processing' && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm animate-pulse"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-600 mr-1.5 animate-ping" />
                        Processing...
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm">
                    <span className="hidden md:inline">
                      {new Date(file.uploadDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="md:hidden">
                      {new Date(file.uploadDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-400 hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                      <span className="text-amber-600">{timeRemaining()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="group hover:border-indigo-300 hover:bg-indigo-50 transition-all hidden md:flex"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Copy Text
                  </>
                )}
              </Button>



              {onDownload && (
                <Button
                  size="sm"
                  onClick={() => onDownload(file.id)}
                  disabled={file.status !== 'completed'}
                  className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 group hidden md:flex"
                >
                  <Download className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Download DOCX
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                disabled={file.status !== 'completed'}
                className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 group"
              >
                <Download className="w-4 h-4 sm:mr-2 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {file.status === 'processing' && (
            <div className="mt-4 animate-scale-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-slate-700 text-sm">Processing PDF...</span>
                </div>
                <span className="text-slate-700 text-sm">{file.progress}%</span>
              </div>
              <Progress value={file.progress} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* View Mode Selector */}
      {file.status === 'completed' && (
        <div className="glass border-b border-white/60 bg-gradient-to-r from-slate-50/80 to-indigo-50/50 px-4 sm:px-6 py-3 sm:py-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="editor" className="group data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all text-xs sm:text-sm">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Text Editor</span>
                </TabsTrigger>
                <TabsTrigger value="sideBySide" className="group data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all text-xs sm:text-sm">
                  <Columns2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Side-by-Side</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-slate-600 text-xs sm:text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Auto-saved</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {file.status === 'processing' && (
          <div className="min-h-full flex items-center justify-center py-12 animate-scale-in">
            <div className="text-center">
              <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/30 to-blue-300/30 rounded-3xl blur-2xl"></div>
                <FileText className="w-10 h-10 text-indigo-600 relative z-10" />
              </div>
              <h3 className="text-slate-900 mb-2">Processing your PDF...</h3>
              <p className="text-slate-600">
                Extracting text with advanced OCR technology
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {file.status === 'completed' && viewMode === 'editor' && (
          <div className="animate-slide-up">
            <TextEditor text={file.extractedText} onTextChange={handleTextChange} fileId={file.id} />
          </div>
        )}

        {file.status === 'completed' && viewMode === 'sideBySide' && (
          <div className="h-full flex flex-col lg:flex-row animate-slide-up">
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200">
              <PagedPDFViewer 
                fileId={file.id} 
                fileName={file.name} 
              />
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <TextEditor text={file.extractedText} onTextChange={handleTextChange} fileId={file.id} />
            </div>
          </div>
        )}
      </main>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        fileName={file.name}
        content={file.extractedText}
        fileId={file.id}
      />

      <CorrectionDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        onSubmit={handleRequestCorrection}
      />
    </div>
  );
}
