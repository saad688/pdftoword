import { useState, useRef, useEffect } from 'react';
import {
  Undo,
  Redo,
  Type,
  AlignLeft,
  Save,
  Check,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AICorrectionDialog } from './AICorrectionDialog';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { api } from '../services/api';

type TextEditorProps = {
  text: string;
  onTextChange: (newText: string) => void;
  fileId?: string;
};

type HistoryEntry = {
  text: string;
  cursorPosition: number;
};

export function TextEditor({ text, onTextChange, fileId }: TextEditorProps) {
  const [editableText, setEditableText] = useState(text);
  const [history, setHistory] = useState<HistoryEntry[]>([{ text, cursorPosition: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiCorrectionOpen, setAiCorrectionOpen] = useState(false);
  const [selectedTextForCorrection, setSelectedTextForCorrection] = useState('');
  const [currentSelection, setCurrentSelection] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setEditableText(text);
    setHistory([{ text, cursorPosition: 0 }]);
    setHistoryIndex(0);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [text]);

  const handleTextChange = (newText: string, addToHistory = true) => {
    setEditableText(newText);
    setHasUnsavedChanges(true);

    if (addToHistory) {
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ text: newText, cursorPosition });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleSave = async () => {
    if (!fileId) {
      toast.error('Cannot save: File ID not available');
      return;
    }

    setIsSaving(true);
    try {
      // Save to backend DOCX file
      await api.saveTextToDocx(fileId, editableText);
      
      // Update local state
      onTextChange(editableText);
      setHasUnsavedChanges(false);
      
      toast.success('Changes saved to DOCX file', {
        description: 'Your edits have been applied to the Word document',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes', {
        description: 'Could not save changes to the DOCX file',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const entry = history[newIndex];
      setEditableText(entry.text);
      setHistoryIndex(newIndex);
      setHasUnsavedChanges(true);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(entry.cursorPosition, entry.cursorPosition);
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const entry = history[newIndex];
      setEditableText(entry.text);
      setHistoryIndex(newIndex);
      setHasUnsavedChanges(true);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(entry.cursorPosition, entry.cursorPosition);
          textareaRef.current.focus();
        }
      }, 10);
    }
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  const handleClearText = () => {
    if (window.confirm('Are you sure you want to clear all text?')) {
      handleTextChange('');
      toast.success('Text cleared');
    }
  };

  const handleCopy = async () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        toast.success('Text copied');
      }
    }
  };

  const handleCut = async () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selectedText) {
        await navigator.clipboard.writeText(selectedText);
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = editableText.substring(0, start) + editableText.substring(end);
        handleTextChange(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start, start);
          }
        }, 10);
        toast.success('Text cut');
      }
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = editableText.substring(0, start) + clipboardText + editableText.substring(end);
        handleTextChange(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const newPosition = start + clipboardText.length;
            textareaRef.current.setSelectionRange(newPosition, newPosition);
          }
        }, 10);
        toast.success('Text pasted');
      }
    } catch (error) {
      toast.error('Could not paste text');
    }
  };



  const wordCount = editableText.split(/\s+/).filter((word) => word.length > 0).length;
  const lineCount = editableText.split('\n').length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-slate-50/30">
      {/* Toolbar */}
      <div className="glass border-b border-white/60 bg-gradient-to-r from-slate-50/80 to-white px-3 sm:px-6 py-2 sm:py-3 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-max">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Quick Actions */}
            <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 sm:p-1 shadow-sm border border-slate-200/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="hover:bg-indigo-50 hover:text-indigo-700 transition-all group h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Select All (Ctrl+A)"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearText}
                className="hover:bg-red-50 hover:text-red-700 transition-all group h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Clear All Text"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Button clicked');
                  console.log('Current selection state:', currentSelection);
                  
                  if (currentSelection) {
                    setSelectedTextForCorrection(currentSelection);
                    setAiCorrectionOpen(true);
                    toast.success('Dialog opened with selected text');
                  } else {
                    toast.error('Please select text first');
                  }
                }}
                className="hover:bg-purple-50 hover:text-purple-700 transition-all group h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="AI Correction"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 sm:h-8 mx-1 sm:mx-2" />

            {/* History */}
            <div className="flex items-center gap-0.5 bg-white rounded-lg p-0.5 sm:p-1 shadow-sm border border-slate-200/60">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-700 transition-all group h-7 w-7 sm:h-8 sm:w-8 p-0 disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  handleUndo();
                }}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-12 transition-transform" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-700 transition-all group h-7 w-7 sm:h-8 sm:w-8 p-0 disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  handleRedo();
                }}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Save Button & Stats */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className={`px-3 py-1.5 text-xs transition-all ${
                hasUnsavedChanges && !isSaving
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
                  : 'bg-emerald-100 text-emerald-700 cursor-default'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <><Save className="w-3.5 h-3.5 mr-1" />Save to DOCX</>
              ) : (
                <><Check className="w-3.5 h-3.5 mr-1" />Saved</>
              )}
            </Button>
            
            <div className="hidden lg:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-lg shadow-sm border border-slate-200/60">
              <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              <span className="text-slate-700">{wordCount} words</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white rounded-lg shadow-sm border border-slate-200/60">
              <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              <span className="text-slate-700">{lineCount} lines</span>
            </div>
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm border border-slate-200/60">
              <span className="text-slate-700">
                {editableText.length.toLocaleString()} chars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Preview Notice */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>This is a text preview. Tables and complex formatting will appear correctly in the downloaded DOCX file.</span>
            </p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl shadow-slate-200/50 p-4 sm:p-6 lg:p-8 border border-slate-200/60">
            <Textarea
              ref={textareaRef}
              value={editableText}
              onChange={(e) => {
                handleTextChange(e.target.value);
              }}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
                setCurrentSelection(selectedText);
                console.log('Text selected:', selectedText);
              }}
              className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] text-slate-900 border-0 focus:border-0 focus:ring-0 resize-none bg-transparent text-sm sm:text-base leading-relaxed"
              placeholder="Extracted text will appear here..."
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                  } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    handleRedo();
                  } else if (e.key === 'c') {
                    handleCopy();
                  } else if (e.key === 'x') {
                    handleCut();
                  } else if (e.key === 'v') {
                    handlePaste();
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <AICorrectionDialog
        open={aiCorrectionOpen}
        onOpenChange={setAiCorrectionOpen}
        selectedText={selectedTextForCorrection}
        fileId={fileId || ''}
        onCorrection={(correctedText) => {
          if (selectedTextForCorrection) {
            const newText = editableText.replace(selectedTextForCorrection, correctedText);
            handleTextChange(newText);
            toast.success('Text corrected by AI');
          }
        }}
      />
    </div>
  );
}