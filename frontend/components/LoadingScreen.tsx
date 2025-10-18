import { FileText, Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl blur-2xl opacity-50"></div>
          <FileText className="w-10 h-10 text-white relative z-10" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <h2 className="text-xl text-slate-900">Loading PDF Text Extractor</h2>
        </div>
        <p className="text-slate-600">Initializing application...</p>
      </div>
    </div>
  );
}