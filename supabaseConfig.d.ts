// Type definitions for supabaseConfig.js
declare module '../../supabaseConfig' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}
