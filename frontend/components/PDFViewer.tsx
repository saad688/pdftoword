import { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';

type PDFViewerProps = {
  fileId: string;
  fileName: string;
};

export function PDFViewer({ fileId, fileName }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get PDF from backend
        const response = await fetch(`http://localhost:8000/api/files/${fileId}/pdf`, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf'
          }
        });
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

    // Cleanup URL on unmount
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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-2">Failed to load PDF</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="h-full p-4">
        <div className="bg-white rounded-2xl shadow-xl h-full overflow-hidden">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={`PDF Preview - ${fileName}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}