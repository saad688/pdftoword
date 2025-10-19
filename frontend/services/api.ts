import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';

const API_URL = config.apiUrl;
const API_TIMEOUT = config.apiTimeout;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'testkey123', // Add API key for backend authentication
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure API key is always present
    if (!config.headers['x-api-key']) {
      config.headers['x-api-key'] = 'testkey123';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error - Log safely without exposing sensitive data
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response - Log safely
      console.error('Network Error:', {
        message: 'Network request failed',
        url: error.config?.url,
      });
    } else {
      // Something else happened - Log safely
      console.error('Request Error:', {
        message: 'Request configuration error',
      });
    }
    return Promise.reject(error);
  }
);

// Types
export interface FileStatus {
  id: string;
  name: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  progress_message?: string;
  upload_date: string;
  expiry_date: string;
  file_size: number;
  word_count: number;
  char_count: number;
  line_count: number;
  extracted_text: string;
  pages_data?: any[];
  error?: string;
}

export interface UploadResponse {
  file_id: string;
  message: string;
}

export interface BatchUploadResponse {
  file_ids: string[];
  message: string;
}

export interface FilesListResponse {
  files: FileStatus[];
}

export interface SaveResponse {
  message: string;
}

export interface ExportResponse {
  export_path: string;
  message: string;
}

// API Methods
export const api = {
  // Upload single file
  uploadFile: async (file: File, useCache: boolean = true): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('use_cache', useCache.toString());

    // Log the actual request being sent
    console.log(`🌐 Making POST request to /upload`);
    console.log(`📦 FormData contents:`);
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log(`✅ API Response:`, response.data);

    return response.data;
  },

  // Upload multiple files
  uploadBatch: async (files: File[], useCache: boolean = true): Promise<BatchUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('use_cache', useCache.toString());

    const response = await apiClient.post<BatchUploadResponse>('/upload-batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get file status
  getFileStatus: async (fileId: string): Promise<FileStatus> => {
    const response = await apiClient.get<FileStatus>(`/files/${fileId}`);
    return response.data;
  },

  // Get all files
  getAllFiles: async (): Promise<FileStatus[]> => {
    const response = await apiClient.get<FilesListResponse>('/files');
    return response.data.files;
  },

  // Update file text
  updateFileText: async (fileId: string, text: string): Promise<void> => {
    await apiClient.put(`/files/${fileId}/text`, { text });
  },

  // AI text correction
  correctText: async (
    fileId: string,
    selectedText: string,
    correction: string
  ): Promise<void> => {
    await apiClient.post(`/files/${fileId}/correct`, {
      selected_text: selectedText,
      correction,
    });
  },

  // AI correction with explanation
  aiCorrectText: async (
    fileId: string,
    selectedText: string,
    userExplanation: string
  ): Promise<{ corrected_text: string }> => {
    const response = await apiClient.post(`/files/${fileId}/ai-correct`, {
      selected_text: selectedText,
      user_explanation: userExplanation,
    });
    return response.data;
  },

  // Download file
  downloadFile: async (fileId: string, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.replace('.pdf', '.docx'));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },

  // Save text changes to DOCX
  saveTextToDocx: async (fileId: string, text: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/files/${fileId}/save`, { text });
    return response.data;
  },

  // Export file to different formats
  exportFile: async (fileId: string, format: string): Promise<{ export_path: string; message: string }> => {
    const response = await apiClient.post(`/files/${fileId}/export`, { format });
    return response.data;
  },

  // Download exported file
  downloadExport: async (fileId: string, exportPath: string, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/files/${fileId}/export/${exportPath}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default api;
