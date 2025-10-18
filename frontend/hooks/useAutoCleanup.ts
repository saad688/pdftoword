import { useEffect } from 'react';
import { api } from '../services/api';

export function useAutoCleanup(files: any[], onFileDeleted: (fileId: string) => void) {
  useEffect(() => {
    const checkExpiredFiles = async () => {
      const now = new Date();
      
      for (const file of files) {
        const expiryDate = new Date(file.expiryDate);
        if (now >= expiryDate) {
          try {
            await api.deleteFile(file.id);
            onFileDeleted(file.id);
          } catch (error) {
            console.error(`Failed to delete expired file ${file.id}:`, error);
          }
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiredFiles, 60000);
    
    // Initial check
    checkExpiredFiles();

    return () => clearInterval(interval);
  }, [files, onFileDeleted]);
}