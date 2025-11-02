import { useState, useEffect } from 'react';
import { UploadPage } from './components/UploadPage';
import { EditorPage } from './components/EditorPage';
import { BatchProcessingPage } from './components/BatchProcessingPage';
import { StoredFilesPage } from './components/StoredFilesPage';
import { LoadingScreen } from './components/LoadingScreen';
import { ProcessingScreenWithMessages } from './components/ProcessingScreenWithMessages';
import { LoginPage } from './components/LoginPage';
import { ProcessingModeSelector } from './components/ProcessingModeSelector';
import OnboardingGuide from './components/OnboardingGuide';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { api, FileStatus } from './services/api';
import { useAutoCleanup } from './hooks/useAutoCleanup';

export type ProcessedFile = {
  id: string;
  name: string;
  uploadDate: Date;
  expiryDate: Date;
  status: 'processing' | 'completed' | 'error';
  extractedText: string;
  originalFile: File | null;
  progress: number;
  progress_message?: string;
  fileSize: number;
  wordCount: number;
  charCount: number;
  lineCount: number;
  pages_data?: any[];
  error?: string;
};

export type AppView = 'upload' | 'editor' | 'batch' | 'stored' | 'processing';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [previousView, setPreviousView] = useState<AppView>('upload');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);
  const [processingFileIds, setProcessingFileIds] = useState<Set<string>>(new Set());
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [processingMode, setProcessingMode] = useState<string>('moderate');

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  // Check backend health and initialize app
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const initializeApp = async () => {
      try {
        // Check backend status first
        console.log('🔍 Checking backend status...');
        const statusResponse = await api.checkStatus();
        console.log('✅ Backend status:', statusResponse);
        setIsBackendHealthy(true);
        
        // Load existing files
        const apiFiles = await api.getAllFiles();
        const convertedFiles = apiFiles.map(convertApiFileToProcessedFile);
        setFiles(convertedFiles);

        // Track processing files
        const processing = new Set(
          apiFiles.filter((f) => f.status === 'processing').map((f) => f.id)
        );
        setProcessingFileIds(processing);
        
        // Check if first time user
        const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
        if (!hasSeenOnboarding && convertedFiles.length === 0) {
          setShowOnboarding(true);
        }
        
      } catch (error: any) {
        console.error('❌ Backend connection failed:', error);
        setIsBackendHealthy(false);
        const errorMessage = error?.message || 'Service temporarily unavailable. Please try again in a few moments.';
        toast.error('Connection Error', {
          description: errorMessage,
        });
      } finally {
        // Add minimum loading time for better UX
        setTimeout(() => setIsInitialLoading(false), 1000);
      }
    };
    
    initializeApp();
  }, [isAuthenticated]);



  const convertApiFileToProcessedFile = (apiFile: FileStatus): ProcessedFile => ({
    id: apiFile.id,
    name: apiFile.name,
    uploadDate: new Date(apiFile.upload_date),
    expiryDate: new Date(apiFile.expiry_date),
    status: apiFile.status,
    extractedText: apiFile.extracted_text,
    originalFile: null,
    progress: apiFile.progress,
    progress_message: apiFile.progress_message,
    fileSize: apiFile.file_size,
    wordCount: apiFile.word_count,
    charCount: apiFile.char_count,
    lineCount: apiFile.line_count,
    pages_data: apiFile.pages_data,
    error: apiFile.error,
  });

  const navigateTo = (view: AppView) => {
    if (currentView !== view) {
      setPreviousView(currentView);
      setCurrentView(view);
    }
  };

  const goBack = () => {
    const targetView = previousView !== currentView ? previousView : 'upload';
    setPreviousView('upload'); // Reset to avoid loops
    setCurrentView(targetView);
  };

  const handleFilesUploaded = async (newFiles: File[], isBatch: boolean, useCache: boolean = true) => {
    console.log(`📨 App.tsx handleFilesUploaded: useCache=${useCache}, isBatch=${isBatch}, processingMode=${processingMode}`);
    try {
      if (isBatch) {
        // Batch upload
        const response = await api.uploadBatch(newFiles, useCache, processingMode);
        toast.success(`Uploaded ${response.file_ids.length} files`, {
          description: 'Processing will begin shortly',
        });

        // Add processing files IDs
        response.file_ids.forEach((id) => {
          setProcessingFileIds((prev) => new Set(prev).add(id));
        });

        // Fetch file details
        const fileStatuses = await Promise.all(
          response.file_ids.map((id) => api.getFileStatus(id))
        );

        const processedFiles = fileStatuses.map((file, index) => ({
          ...convertApiFileToProcessedFile(file),
          originalFile: newFiles[index],
        }));

        setFiles((prev) => [...prev, ...processedFiles]);
        navigateTo('batch');
      } else {
        // Single upload
        console.log(`🚀 App.tsx calling uploadFile with useCache=${useCache}, processingMode=${processingMode}`);
        const response = await api.uploadFile(newFiles[0], useCache, processingMode);
        console.log(`✅ Upload response:`, response);
        toast.success('File uploaded successfully', {
          description: 'Starting text extraction...',
        });

        setProcessingFileIds((prev) => new Set(prev).add(response.file_id));

        // Create initial file entry without fetching status to avoid delay
        const initialFile: ProcessedFile = {
          id: response.file_id,
          name: newFiles[0].name,
          uploadDate: new Date(),
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'processing',
          extractedText: '',
          originalFile: newFiles[0],
          progress: 0,
          progress_message: 'Starting...',
          fileSize: newFiles[0].size,
          wordCount: 0,
          charCount: 0,
          lineCount: 0,
          pages_data: []
        };

        setFiles((prev) => [...prev, initialFile]);
        setCurrentFileId(response.file_id);
        setProcessingFileId(response.file_id);
        navigateTo('processing');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error.response?.data?.detail || error.message || 'Unknown error',
      });
    }
  };

  // Poll processing files
  useEffect(() => {
    if (processingFileIds.size === 0) return;
    
    const pollingIntervals: NodeJS.Timeout[] = [];
    
    processingFileIds.forEach((fileId) => {
      const pollFile = async () => {
        try {
          const apiFile = await api.getFileStatus(fileId);
          
          // Update file data
          setFiles((prev) =>
            prev.map((f) =>
              f.id === apiFile.id ? convertApiFileToProcessedFile(apiFile) : f
            )
          );
          
          if (apiFile.status === 'completed' || apiFile.status === 'error') {
            // Remove from processing
            setProcessingFileIds((prev) => {
              const next = new Set(prev);
              next.delete(apiFile.id);
              return next;
            });
            
            if (apiFile.status === 'completed') {
              // Auto-navigate to editor when processing completes (only if still on processing screen)
              if (processingFileId === apiFile.id && currentView === 'processing') {
                setTimeout(() => {
                  setCurrentFileId(apiFile.id);
                  setCurrentView('editor');
                  toast.success(`Processing complete: ${apiFile.name}`, {
                    description: 'All pages processed successfully!'
                  });
                }, 2000); // Longer delay to show completion message
              } else {
                // Show notification if user is elsewhere
                toast.success(`Processing complete: ${apiFile.name}`, {
                  description: 'File is ready for editing',
                  action: {
                    label: 'View',
                    onClick: () => {
                      setCurrentFileId(apiFile.id);
                      setCurrentView('editor');
                    }
                  }
                });
              }
            } else {
              toast.error('Processing failed', {
                description: apiFile.error || 'Unknown error',
              });
              if (processingFileId === apiFile.id) {
                setProcessingFileId(null);
              }
            }
          }
        } catch (error: any) {
          console.error('Polling error:', error);
          setProcessingFileIds((prev) => {
            const next = new Set(prev);
            next.delete(fileId);
            return next;
          });
        }
      };
      
      // Start polling immediately
      pollFile();
      
      // Set up interval - adaptive polling based on file status
      const interval = setInterval(pollFile, 2000); // Slower polling to reduce server load
      pollingIntervals.push(interval);
    });
    
    return () => {
      pollingIntervals.forEach(clearInterval);
    };
  }, [processingFileIds, processingFileId, currentView]);

  // Auto-cleanup expired files
  useAutoCleanup(files, (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (currentFileId === fileId) {
      setCurrentFileId(null);
      setCurrentView('upload');
    }
  });

  const updateFileText = async (fileId: string, newText: string) => {
    try {
      await api.updateFileText(fileId, newText);

      // Update local state
      const wordCount = newText.split(/\s+/).filter((word) => word.length > 0).length;
      const charCount = newText.length;
      const lineCount = newText.split('\n').length;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, extractedText: newText, wordCount, charCount, lineCount }
            : f
        )
      );

      // Removed excessive toast messages
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Failed to save text', {
        description: error.response?.data?.detail || error.message,
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await api.deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success('File deleted');

      if (currentFileId === fileId) {
        setCurrentFileId(null);
        setCurrentView('upload');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file', {
        description: error.response?.data?.detail || error.message,
      });
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      await api.downloadFile(fileId, file.name);
      toast.success('Download started');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download file', {
        description: error.response?.data?.detail || error.message,
      });
    }
  };

  const currentFile = files.find((f) => f.id === currentFileId) || null;

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setFiles([]);
    setCurrentFileId(null);
    setCurrentView('upload');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {!isBackendHealthy && (
        <div className="bg-red-500 text-white px-4 py-2 text-center">
          ⚠️ AI Processing Service Unavailable - Cannot connect to backend. Please check your internet connection and try again.
        </div>
      )}

      {showOnboarding && (
        <OnboardingGuide onComplete={() => setShowOnboarding(false)} />
      )}

      {currentView === 'upload' && (
        <UploadPage
          onFilesUploaded={handleFilesUploaded}
          onViewStored={() => navigateTo('stored')}
          hasStoredFiles={files.length > 0}
          onLogout={handleLogout}
          processingMode={processingMode}
          onProcessingModeChange={setProcessingMode}
        />
      )}
      {currentView === 'editor' && currentFile && (
        <EditorPage
          file={currentFile}
          onUpdateText={updateFileText}
          onBack={() => {
            if (processingFileId === currentFile.id) {
              setProcessingFileId(null);
            }
            goBack();
          }}
          onDownload={downloadFile}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'batch' && (
        <BatchProcessingPage
          files={files}
          onSelectFile={(fileId) => {
            setCurrentFileId(fileId);
            navigateTo('editor');
          }}
          onUpdateText={updateFileText}
          onDeleteFile={deleteFile}
          onBack={goBack}
          onViewStored={() => navigateTo('stored')}
          onDownload={downloadFile}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'stored' && (
        <StoredFilesPage
          files={files}
          onSelectFile={(fileId) => {
            setCurrentFileId(fileId);
            navigateTo('editor');
          }}
          onDeleteFile={deleteFile}
          onBack={goBack}
          onDownload={downloadFile}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'processing' && processingFileId && (
        <ProcessingScreenWithMessages
          fileName={files.find(f => f.id === processingFileId)?.name || 'Unknown file'}
          progress={files.find(f => f.id === processingFileId)?.progress || 0}
          progressMessage={files.find(f => f.id === processingFileId)?.progress_message || 'Processing your file...'}
          status={files.find(f => f.id === processingFileId)?.status || 'processing'}
          error={files.find(f => f.id === processingFileId)?.error}
          onTimeout={() => {
            setProcessingFileId(null);
            navigateTo('upload');
          }}
          onViewStored={() => {
            setProcessingFileId(null);
            navigateTo('stored');
          }}
        />
      )}
      <Toaster position="top-right" richColors />
      </div>
    </ErrorBoundary>
  );
}