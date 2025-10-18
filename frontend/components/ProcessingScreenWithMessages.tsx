import { useState, useEffect } from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

type ProcessingScreenWithMessagesProps = {
  fileName: string;
  progress: number;
  progressMessage?: string;
  status: 'processing' | 'completed' | 'error';
  error?: string;
  onTimeout: () => void;
};

export function ProcessingScreenWithMessages({ 
  fileName, 
  progress, 
  progressMessage,
  status, 
  error, 
  onTimeout 
}: ProcessingScreenWithMessagesProps) {
  const [message, setMessage] = useState('Uploading...');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === 'error') {
      setMessage('Processing failed');
      return;
    }

    if (status === 'completed') {
      setMessage('Processing complete!');
      return;
    }

    // Dynamic messages based on progress and time
    if (progress === 0) {
      setMessage('Uploading...');
    } else if (progress < 20) {
      setMessage('Processing...');
    } else if (progress < 80) {
      if (timeElapsed > 30) {
        setMessage('Still processing... It is taking longer than usual');
      } else if (timeElapsed > 15) {
        setMessage('Still processing...');
      } else {
        setMessage('Extracting text with AI...');
      }
    } else {
      setMessage('Almost done...');
    }

    // Timeout after 2 minutes
    if (timeElapsed > 120 && status === 'processing') {
      onTimeout();
    }
  }, [progress, status, timeElapsed, onTimeout]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/40 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/30">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl text-slate-900 mb-2">Processing Failed</h2>
          <p className="text-slate-600 mb-4 truncate" title={fileName}>{fileName}</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <Button 
            onClick={onTimeout}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
          {status === 'completed' ? (
            <CheckCircle2 className="w-10 h-10 text-white relative z-10" />
          ) : (
            <FileText className="w-10 h-10 text-white relative z-10" />
          )}
        </div>

        <h2 className="text-xl text-slate-900 mb-2">
          {status === 'completed' ? 'Processing Complete!' : 'Processing Your Document'}
        </h2>
        
        <p className="text-slate-600 mb-6 truncate" title={fileName}>
          {fileName}
        </p>

        {status === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-slate-700">{progressMessage || message}</span>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="flex justify-between text-sm text-slate-600">
              <span>{progress}% complete</span>
              <span>{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>

            {timeElapsed > 45 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-700 text-sm">
                  Large files may take longer to process. Please wait...
                </p>
              </div>
            )}

            {timeElapsed > 90 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-700 text-sm">
                  Processing is taking longer than expected. You can wait or try again later.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onTimeout}
                  className="mt-2"
                >
                  Cancel & Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span>Text extraction completed successfully!</span>
            </div>
            <p className="text-slate-600 text-sm">Redirecting to editor...</p>
          </div>
        )}
      </div>
    </div>
  );
}