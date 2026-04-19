/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_USE_PUTER_LLM?: string;
  readonly VITE_PUTER_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  puter?: {
    ai?: {
      chat: (
        prompt: string,
        options?: { model?: string; temperature?: number; max_tokens?: number },
      ) => Promise<string | { text?: string }>;
    };
  };
}
