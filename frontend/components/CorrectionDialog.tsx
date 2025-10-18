import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Sparkles, Wand2 } from 'lucide-react';
import { Progress } from './ui/progress';

type CorrectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedText: string, correction: string) => void;
};

export function CorrectionDialog({ open, onOpenChange, onSubmit }: CorrectionDialogProps) {
  const [selectedText, setSelectedText] = useState('');
  const [correction, setCorrection] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = () => {
    if (!selectedText.trim()) return;

    setProcessing(true);
    setProgress(0);

    // Simulate AI correction process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProcessing(false);
      setProgress(0);

      // If no manual correction provided, simulate an AI correction
      const finalCorrection = correction.trim() || `${selectedText} [AI Corrected]`;
      onSubmit(selectedText, finalCorrection);

      // Reset form
      setSelectedText('');
      setCorrection('');
      onOpenChange(false);
    }, 1500);
  };

  const handleReset = () => {
    setSelectedText('');
    setCorrection('');
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <span className="truncate">AI-Powered Text Correction</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Select the text that needs correction. Our AI will suggest improvements, or you can
            provide your own correction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-3 sm:py-4">
          {/* Incorrect Text */}
          <div className="space-y-2">
            <Label htmlFor="incorrect-text" className="text-slate-900 flex items-center gap-2">
              Incorrect Text
              <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="incorrect-text"
                placeholder="Paste or type the text that needs to be corrected..."
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] border-slate-200 focus:border-purple-300 focus:ring-purple-200 transition-all text-sm"
                disabled={processing}
              />
              {selectedText && (
                <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-slate-200">
                  {selectedText.length} chars
                </div>
              )}
            </div>
          </div>

          {/* Correction */}
          <div className="space-y-2">
            <Label htmlFor="correction" className="text-slate-900 flex items-center gap-2">
              Your Correction
              <span className="text-slate-500 text-xs">(Optional)</span>
            </Label>
            <div className="relative">
              <Textarea
                id="correction"
                placeholder="Provide the corrected text, or leave empty for AI suggestion..."
                value={correction}
                onChange={(e) => setCorrection(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] border-slate-200 focus:border-emerald-300 focus:ring-emerald-200 transition-all text-sm"
                disabled={processing}
              />
              {correction && (
                <div className="absolute bottom-2 right-2 text-xs text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-emerald-200">
                  {correction.length} chars
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
              <p className="text-purple-900 text-xs sm:text-sm">
                Leave empty to let AI suggest a correction automatically
              </p>
            </div>
          </div>

          {/* Processing Indicator */}
          {processing && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 animate-scale-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-indigo-900">
                    AI is analyzing your text...
                  </span>
                </div>
                <span className="text-indigo-900">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-indigo-700 text-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Processing with advanced AI models</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedText.trim() || processing}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 group"
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Apply Correction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
