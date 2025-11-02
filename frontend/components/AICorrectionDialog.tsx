import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AICorrectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  onCorrection: (correctedText: string) => void;
  fileId: string;
};

export function AICorrectionDialog({ 
  open, 
  onOpenChange, 
  selectedText, 
  onCorrection,
  fileId 
}: AICorrectionDialogProps) {
  const [explanation, setExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCorrection = async () => {
    if (!explanation.trim()) {
      toast.error('Please provide an explanation');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { api } = await import('../services/api');
      const result = await api.aiCorrectText(fileId, selectedText, explanation);
      onCorrection(result.corrected_text);
      toast.success('Text corrected successfully');
      onOpenChange(false);
      setExplanation('');
    } catch (error) {
      toast.error('AI correction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Text Correction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Selected Text
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border text-sm max-h-32 overflow-y-auto">
              <pre className="text-slate-900 whitespace-pre-wrap font-sans text-sm leading-relaxed">"{selectedText}"</pre>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Explain the correction needed
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe what's wrong and how it should be corrected..."
              className="min-h-24"
              disabled={isProcessing}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCorrection}
            disabled={!explanation.trim() || isProcessing}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Correcting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply AI Correction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}