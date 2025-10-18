import { useState } from 'react';
import { ProcessedFile } from '../App';
import {
  ArrowLeft,
  Download,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type BatchProcessingPageProps = {
  files: ProcessedFile[];
  onSelectFile: (fileId: string) => void;
  onUpdateText: (fileId: string, newText: string) => void;
  onDeleteFile: (fileId: string) => void;
  onBack: () => void;
  onViewStored: () => void;
  onDownload?: (fileId: string) => void;
};

export function BatchProcessingPage({
  files,
  onSelectFile,
  onDeleteFile,
  onBack,
  onViewStored,
}: BatchProcessingPageProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleAllFiles = () => {
    if (selectedFiles.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedCount = selectedFiles.size;
    if (selectedCount === 0) {
      toast.error('Please select files to export');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: `Exporting ${selectedCount} file${selectedCount > 1 ? 's' : ''}...`,
        success: `${selectedCount} file${selectedCount > 1 ? 's' : ''} exported successfully`,
        error: 'Export failed',
      }
    );
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete);
      toast.success('File deleted');
      setFileToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const completedFiles = files.filter((f) => f.status === 'completed').length;
  const processingFiles = files.filter((f) => f.status === 'processing').length;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'processing':
        return (
          <div className="w-4 h-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        );
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 shadow-sm"
          >
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm animate-pulse"
          >
            Processing
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-0 shadow-sm">
            Error
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 animate-slide-up">
      {/* Header */}
      <header className="glass border-b border-white/60 shadow-sm bg-white/95 backdrop-blur-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="group hover:bg-slate-100 hover:scale-105 transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden sm:block" />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 relative z-10" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-slate-900 text-sm sm:text-base truncate">Batch Processing</h1>
                  <p className="text-slate-600 text-xs sm:text-sm truncate">
                    {files.length} file{files.length !== 1 ? 's' : ''} • {completedFiles}{' '}
                    done
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewStored}
                className="group hover:border-amber-300 hover:bg-amber-50 transition-all hidden md:flex"
              >
                <Clock className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Stored Files
              </Button>
              <Button
                size="sm"
                onClick={handleExportSelected}
                disabled={selectedFiles.size === 0}
                className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 group"
              >
                <Download className="w-4 h-4 sm:mr-2 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">Export ({selectedFiles.size})</span>
                <span className="sm:hidden">({selectedFiles.size})</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-5 border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Files</p>
                <p className="text-slate-900">{files.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/50 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-sm mb-1">Completed</p>
                <p className="text-emerald-900">{completedFiles}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5 border-blue-200/60 bg-gradient-to-br from-blue-50 to-cyan-50/50 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm mb-1">Processing</p>
                <p className="text-blue-900">{processingFiles}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200/60 focus:border-indigo-300 transition-all text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      {/* Files Table */}
      <main className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 animate-slide-up overflow-x-auto" style={{ animationDelay: '0.3s' }}>
        <Card className="border-slate-200/60 shadow-xl overflow-hidden min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50/30 hover:from-slate-50 hover:to-indigo-50/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedFiles.size === filteredFiles.length && filteredFiles.length > 0
                    }
                    onCheckedChange={toggleAllFiles}
                  />
                </TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file, index) => (
                <TableRow
                  key={file.id}
                  className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/20 transition-all animate-slide-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <span className="text-slate-900 text-sm sm:text-base max-w-[150px] sm:max-w-xs truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      {getStatusBadge(file.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.status === 'processing' ? (
                      <div className="space-y-2">
                        <Progress value={file.progress} className="h-2 w-32" />
                        <span className="text-slate-600 text-sm">{file.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                      {new Date(file.uploadDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectFile(file.id)}
                        disabled={file.status !== 'completed'}
                        className="hover:bg-indigo-50 hover:text-indigo-700 transition-all disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(file.id)}
                        className="hover:bg-red-50 hover:text-red-700 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file and its extracted
              text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
