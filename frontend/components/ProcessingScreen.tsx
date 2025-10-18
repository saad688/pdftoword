import { FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

type ProcessingScreenProps = {
  fileName: string;
  progress: number;
  status: 'processing' | 'completed' | 'error';
  onContinue: () => void;
  error?: string;
};

export function ProcessingScreen({ fileName, progress, status, onContinue, error }: ProcessingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl blur-2xl opacity-50"></div>
          {status === 'completed' ? (
            <CheckCircle2 className="w-10 h-10 text-white relative z-10" />
          ) : (
            <FileText className="w-10 h-10 text-white relative z-10" />
          )}
        </div>

        <h2 className="text-xl text-slate-900 mb-2">
          {status === 'processing' && 'Processing Your Document'}
          {status === 'completed' && 'Processing Complete!'}
          {status === 'error' && 'Processing Failed'}
        </h2>

        <p className="text-slate-600 mb-6 truncate" title={fileName}>
          {fileName}
        </p>

        {status === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-slate-700">Extracting text with AI...</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-slate-600">{progress}% complete</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>Text extraction completed successfully!</span>
            </div>
            <Button 
              onClick={onContinue}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:scale-105 transition-all"
            >
              Continue to Editor
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-600">
              <p>Failed to process the document</p>
              {error && <p className="text-sm mt-2">{error}</p>}
            </div>
            <Button 
              onClick={onContinue}
              variant="outline"
              className="hover:bg-red-50 hover:border-red-300"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}