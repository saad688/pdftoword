import { ProcessedFile } from '../App';
import {
  ArrowLeft,
  FileText,
  Clock,
  Trash2,
  Eye,
  AlertCircle,
  Download,
  LogOut,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
import { useState } from 'react';
import { toast } from 'sonner';

type StoredFilesPageProps = {
  files: ProcessedFile[];
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onBack: () => void;
  onDownload?: (fileId: string) => void;
  onLogout?: () => void;
};

export function StoredFilesPage({
  files,
  onSelectFile,
  onDeleteFile,
  onBack,
  onLogout,
}: StoredFilesPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete);
      toast.success('File deleted successfully');
      setFileToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getTimeRemaining = (expiryDate: Date) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const msLeft = expiry.getTime() - now.getTime();
    
    if (msLeft <= 0) {
      return 'Expired';
    }
    
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (daysLeft > 0) {
      return `${daysLeft}d ${hoursLeft % 24}h remaining`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m remaining`;
    } else {
      return `${minutesLeft}m remaining`;
    }
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const msLeft = expiry.getTime() - now.getTime();
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));

    if (msLeft <= 0) {
      return 'expired';
    } else if (hoursLeft <= 6) {
      return 'critical';
    } else if (hoursLeft <= 24) {
      return 'warning';
    }
    return 'normal';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20 animate-slide-up">
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
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-xl sm:rounded-2xl blur-xl"></div>
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 relative z-10" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-slate-900 text-sm sm:text-base truncate">Stored Files</h1>
                  <p className="text-slate-600 text-xs sm:text-sm truncate">
                    {files.length} file{files.length !== 1 ? 's' : ''} • 2 days
                  </p>
                </div>
              </div>
            </div>
            
            {onLogout && (
              <Button
                size="sm"
                onClick={onLogout}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex-shrink-0"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Card className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-200/60 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-blue-900 mb-1 text-sm sm:text-base">Automatic Storage Management</p>
              <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                Your processed files are securely stored for 2 days. After this period, they will
                be automatically removed. Make sure to export any files you need before they
                expire.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Files Grid */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        {files.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px] animate-scale-in px-4">
            <div className="text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-white rounded-2xl sm:rounded-3xl blur-2xl"></div>
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 relative z-10" />
              </div>
              <h3 className="text-slate-900 mb-2">No Stored Files</h3>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Upload and process PDFs to see them stored here
              </p>
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:scale-105 transition-all"
              >
                Upload Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {files.map((file, index) => {
              const expiryStatus = getExpiryStatus(file.expiryDate);
              return (
                <Card
                  key={file.id}
                  className="p-4 sm:p-6 border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-slate-900 text-sm sm:text-base truncate group-hover:text-indigo-700 transition-colors"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm">
                          <span>
                            {new Date(file.uploadDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-slate-400" />
                          <span>{formatFileSize(file.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    {file.status === 'completed' && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-0 shadow-sm"
                      >
                        Completed
                      </Badge>
                    )}
                    {file.status === 'processing' && (
                      <div className="space-y-2">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 shadow-sm animate-pulse"
                        >
                          Processing {file.progress}%
                        </Badge>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 border-0 shadow-sm">
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* Expiry Info */}
                  <div
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4 transition-all ${
                      expiryStatus === 'expired'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300'
                        : expiryStatus === 'critical'
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
                        : expiryStatus === 'warning'
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200'
                        : 'bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          expiryStatus === 'expired'
                            ? 'text-gray-600'
                            : expiryStatus === 'critical'
                            ? 'text-red-600 animate-pulse'
                            : expiryStatus === 'warning'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      />
                      <span
                        className={`text-xs sm:text-sm ${
                          expiryStatus === 'expired'
                            ? 'text-gray-900 font-semibold'
                            : expiryStatus === 'critical'
                            ? 'text-red-900'
                            : expiryStatus === 'warning'
                            ? 'text-amber-900'
                            : 'text-slate-900'
                        }`}
                      >
                        {getTimeRemaining(file.expiryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all group/btn disabled:opacity-50"
                      onClick={() => onSelectFile(file.id)}
                      disabled={file.status !== 'completed' || expiryStatus === 'expired'}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      {expiryStatus === 'expired' ? 'Expired' : file.status === 'completed' ? 'View' : 'Processing...'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (file.status === 'completed' && expiryStatus !== 'expired') {
                          window.open(`http://localhost:8000/api/files/${file.id}/download`, '_blank');
                        }
                      }}
                      disabled={file.status !== 'completed' || expiryStatus === 'expired'}
                      className="group hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(file.id)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all group/btn"
                    >
                      <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the file and its extracted
              text from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
