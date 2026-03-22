import { API_CONFIG } from '@shared/config';

export interface ApiError {
  status: 'error';
  code: number;
  message: string;
  suggestion?: string;
}

export interface StatusResponse {
  status: 'ok' | 'error';
  code?: number;
  providers?: {
    gemini: boolean;
    sambanova: boolean;
  };
  timestamp?: string;
}

export interface CompletionResponse {
  suggestion: string;
  status?: 'ok' | 'error';
  code?: number;
  message?: string;
}

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  timeout?: number;
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkStatus(): Promise<StatusResponse> {
  const response = await fetchWithTimeout('/api/status', {
    timeout: 15000,
  });

  if (response.status === 503) {
    const data = await response.json();
    return {
      status: 'error',
      code: 503,
      providers: data.providers,
      timestamp: data.timestamp,
    };
  }

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`);
  }

  return response.json();
}

export async function generateCompletion(
  body: {
    text: string;
    mode?: string;
    style?: string;
    provider?: string;
    geminiApiKey?: string;
    sambaNovaApiKey?: string;
    geminiModel?: string;
  },
  options: { retries?: number; timeout?: number } = {}
): Promise<CompletionResponse> {
  const { retries = API_CONFIG.maxRetries, timeout = API_CONFIG.timeout } =
    options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        timeout,
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.status === 503) {
        const waitTime = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries && isRetryableError(lastError)) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('Request failed after retries');
}

function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'network',
    'fetch',
    'aborted',
  ];
  return retryablePatterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}
