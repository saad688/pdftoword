import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

type MobilePDFViewerProps = {
  fileId: string;
  fileName: string;
};

export function MobilePDFViewer({ fileId, fileName }: MobilePDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://pdftoword-0d2m.onrender.com/api/files/${fileId}/pdf`, {
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

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [fileId]);

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
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
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-2">Failed to load PDF</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="h-full flex flex-col">
        {/* Mobile PDF Controls */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-700 truncate flex-1 mr-2">
            {fileName}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button
              onClick={handleOpenInNewTab}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-2">
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
            {pdfUrl && (
              <div className="h-full w-full">
                {/* Try multiple approaches for mobile PDF viewing */}
                <object
                  data={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  <embed
                    src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
                    type="application/pdf"
                    className="w-full h-full"
                  />
                </object>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}