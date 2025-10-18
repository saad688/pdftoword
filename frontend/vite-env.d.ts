/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_ENABLE_AI_CORRECTION?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_POLLING_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
