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
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { FileText, FileType, Download, CheckCircle2, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  content: string;
  fileId?: string;
};

export function ExportDialog({ open, onOpenChange, fileName, content, fileId }: ExportDialogProps) {


  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [exporting, setExporting] = useState(false);

  const formats = [
    {
      value: 'txt',
      label: 'Plain Text',
      extension: '.txt',
      icon: FileText,
      description: 'Simple text format',
      color: 'from-slate-100 to-slate-50',
      iconColor: 'text-slate-600',
    },
    {
      value: 'docx',
      label: 'Microsoft Word',
      extension: '.docx',
      icon: FileType,
      description: 'Editable Word document',
      color: 'from-blue-100 to-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      value: 'pdf',
      label: 'PDF Document',
      extension: '.pdf',
      icon: FileText,
      description: 'Portable document format',
      color: 'from-red-100 to-red-50',
      iconColor: 'text-red-600',
    },
    {
      value: 'html',
      label: 'HTML',
      extension: '.html',
      icon: FileType,
      description: 'Web page format',
      color: 'from-orange-100 to-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      value: 'rtf',
      label: 'Rich Text',
      extension: '.rtf',
      icon: FileType,
      description: 'Rich text format',
      color: 'from-emerald-100 to-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  const convertMarkdownToPlainText = (text: string): string => {
    // Remove markdown formatting for plain text formats
    let converted = text;
    // Bold: **text** or __text__
    converted = converted.replace(/\*\*(.*?)\*\*/g, '$1');
    converted = converted.replace(/__(.*?)__/g, '$1');
    // Italic: *text*
    converted = converted.replace(/\*(.*?)\*/g, '$1');
    return converted;
  };

  const convertMarkdownToHTML = (text: string): string => {
    // Sanitize input to prevent XSS
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };
    
    let html = escapeHtml(text);
    // Bold: **text** - Safe replacement after escaping
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Underline: __text__
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Sanitize filename to prevent XSS
    const safeFileName = escapeHtml(fileName.replace('.pdf', ''));
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${safeFileName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  };

  const handleExport = async () => {
    if (!fileId) {
      toast.error('Export failed', {
        description: 'File ID is required for export',
      });
      return;
    }

    setExporting(true);

    try {
      if (selectedFormat === 'docx') {
        // Direct DOCX download
        await api.downloadFile(fileId, fileName);
        toast.success('DOCX download started');
      } else {
        // Use backend export for other formats
        const exportResult = await api.exportFile(fileId, selectedFormat);
        
        // Extract filename from export path
        const exportFileName = exportResult.export_path.split('/').pop() || `${fileName.replace('.pdf', '')}.${selectedFormat}`;
        
        // Download the exported file
        await api.downloadExport(fileId, exportResult.export_path, exportFileName);
        
        toast.success(`File exported as ${selectedFormat.toUpperCase()}`, {
          description: 'Your file has been downloaded successfully',
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: 'An error occurred while exporting the file',
      });
    } finally {
      setExporting(false);
    }
  };

  const selectedFormatData = formats.find((f) => f.value === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            Export Document
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Choose your preferred format to export the extracted text
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {formats.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.value;
                return (
                  <div
                    key={format.value}
                    className={`relative flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50/30 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedFormat(format.value)}
                  >
                    <RadioGroupItem
                      value={format.value}
                      id={format.value}
                      className="absolute opacity-0"
                    />
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${format.color} rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-sm transition-transform flex-shrink-0 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${format.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={format.value}
                        className="cursor-pointer text-slate-900 block text-sm sm:text-base"
                      >
                        {format.label}
                      </Label>
                      <p className="text-slate-600 text-xs mt-0.5 hidden sm:block">{format.description}</p>
                      <p className="text-slate-500 text-xs mt-0.5 font-mono">{format.extension}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 animate-scale-in flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {/* Preview */}
          {selectedFormatData && (
            <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-lg sm:rounded-xl border border-slate-200 animate-scale-in">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${selectedFormatData.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <selectedFormatData.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedFormatData.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-900 text-xs sm:text-sm truncate">
                    {fileName.replace('.pdf', '')}{selectedFormatData.extension}
                  </p>
                  <p className="text-slate-600 text-xs">{content.length.toLocaleString()} characters</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
