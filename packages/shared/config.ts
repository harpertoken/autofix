const getEnvVar = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || fallback;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }
  return fallback;
};

const getEnvNum = (key: string, fallback: number): number => {
  const val = getEnvVar(key, '');
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const API_CONFIG = {
  baseUrl: getEnvVar('VITE_API_BASE_URL', ''),
  timeout: getEnvNum('VITE_API_TIMEOUT', 30000),
  maxRetries: getEnvNum('VITE_API_MAX_RETRIES', 3),
  retryDelay: getEnvNum('VITE_API_RETRY_DELAY', 1000),
} as const;

export function isProduction(): boolean {
  return getEnvVar('NODE_ENV', 'development') === 'production';
}

export function isVercel(): boolean {
  return !!getEnvVar('VERCEL', '') || !!getEnvVar('VERCEL_URL', '');
}

export function getApiBaseUrl(): string {
  if (API_CONFIG.baseUrl) {
    return API_CONFIG.baseUrl;
  }

  if (isVercel()) {
    return `https://${getEnvVar('VERCEL_URL', '')}`;
  }

  const port = getEnvVar('PORT', '3000');
  return `http://localhost:${port}`;
}
