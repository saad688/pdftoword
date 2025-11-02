// Environment configuration with safe fallbacks

// Safe environment configuration with proper error handling
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    return import.meta?.env?.[key] || defaultValue;
  } catch (error) {
    console.warn(`Failed to read environment variable ${key}, using default`);
    return defaultValue;
  }
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  try {
    const value = getEnvVar(key, defaultValue.toString());
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch (error) {
    console.warn(`Failed to parse environment variable ${key} as number, using default`);
    return defaultValue;
  }
};

export const config = {
  apiUrl: getEnvVar('VITE_API_URL', 'http://127.0.0.1:8000'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 60000),
  enableAiCorrection: getEnvVar('VITE_ENABLE_AI_CORRECTION', 'false') === 'true',
  maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 52428800),
  pollingInterval: getEnvNumber('VITE_POLLING_INTERVAL', 2000),
} as const;

export default config;
