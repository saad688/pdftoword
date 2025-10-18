import { useEffect, useRef } from 'react';
import { api, FileStatus } from '../services/api';

interface UseFilePollingOptions {
  fileId: string;
  onUpdate: (file: FileStatus) => void;
  onComplete?: (file: FileStatus) => void;
  onError?: (error: Error) => void;
  interval?: number;
  enabled?: boolean;
}

export function useFilePolling({
  fileId,
  onUpdate,
  onComplete,
  onError,
  interval = 2000,
  enabled = true,
}: UseFilePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !fileId) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    const pollFileStatus = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const file = await api.getFileStatus(fileId);
        onUpdate(file);
        retryCount = 0; // Reset retry count on success

        // Stop polling if completed or error
        if (file.status === 'completed' || file.status === 'error') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          if (file.status === 'completed' && onComplete) {
            onComplete(file);
          }
        }
      } catch (error) {
        retryCount++;
        console.error(`Polling error (attempt ${retryCount}/${maxRetries}):`, {
          fileId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        if (retryCount >= maxRetries) {
          // Stop polling after max retries
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          if (onError) {
            onError(error as Error);
          }
        }
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial poll
    pollFileStatus();

    // Set up interval
    intervalRef.current = setInterval(pollFileStatus, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fileId, enabled, interval, onUpdate, onComplete, onError]);
}
