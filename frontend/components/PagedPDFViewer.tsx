import { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';

type PagedPDFViewerProps = {
  fileId: string;
  fileName: string;
};

export function PagedPDFViewer({ fileId, fileName }: PagedPDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://127.0.0.1:8000/api/files/${fileId}/pdf`);
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [fileId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-slate-600">Loading PDF preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h3 className="text-slate-900 font-medium">PDF Preview</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-2">Failed to load PDF</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
        <h3 className="text-slate-900 font-medium">PDF Preview</h3>
      </div>

      {/* PDF Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden border border-slate-200">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={fileName}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">PDF preview not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}