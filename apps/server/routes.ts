import type { Express } from 'express';

import {
  generateTextCompletion,
  testApiKey,
  testSambaNovaApiKey,
} from './gemini';
import { textCompletionRequestSchema } from '@shared/schema';
import { logger } from '../../packages/shared/logger.js';
import { API_CONFIG } from '../../packages/shared/config.js';

const DEFAULT_TIMEOUT = API_CONFIG.timeout;
const MAX_RETRIES = API_CONFIG.maxRetries;
const RETRY_DELAY = API_CONFIG.retryDelay;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timeout')), ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result as T;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(fn(), timeout);
      return result;
    } catch (error) {
      lastError = error;
      logger.warn(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        error instanceof Error ? error.message : String(error)
      );

      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        await sleep(Math.pow(2, attempt) * retryDelay);
      } else {
        break;
      }
    }
  }

  throw lastError;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const retryableMessages = [
      'timeout',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
      'rate limit',
      '429',
      '503',
      '502',
      '504',
    ];
    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
}

export function registerRoutes(app: Express): Express {
  app.get('/api/status', async (req, res) => {
    const requestId = crypto.randomUUID();
    logger.info(`[${requestId}] Status check initiated`);

    try {
      const statusResults = await withRetry(
        async () => {
          const [geminiWorking, sambaNovaWorking] = await Promise.all([
            testApiKey().catch((e) => {
              logger.error('Gemini health check failed:', e);
              return false;
            }),
            testSambaNovaApiKey().catch((e) => {
              logger.error('SambaNova health check failed:', e);
              return false;
            }),
          ]);
          return { geminiWorking, sambaNovaWorking };
        },
        {
          maxRetries: 2,
          retryDelay: 500,
          timeout: 10000,
          shouldRetry: isRetryableError,
        }
      );

      const { geminiWorking, sambaNovaWorking } = statusResults;

      const isWorking =
        process.env.NODE_ENV === 'development'
          ? true
          : geminiWorking || sambaNovaWorking;

      logger.info(
        `[${requestId}] Status check complete - Gemini: ${geminiWorking}, SambaNova: ${sambaNovaWorking}`
      );

      const statusCode = isWorking ? 200 : 503;
      res.status(statusCode).json({
        status: isWorking ? 'ok' : 'error',
        code: statusCode,
        providers: {
          gemini: geminiWorking,
          sambanova: sambaNovaWorking,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`[${requestId}] Status check failed:`, error);
      res.status(503).json({
        status: 'error',
        code: 503,
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.post('/api/complete', async (req, res) => {
    const requestId = crypto.randomUUID();
    logger.info(`[${requestId}] Text completion request received`);

    try {
      const parseResult = textCompletionRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
        logger.warn(
          `[${requestId}] Invalid request body:`,
          parseResult.error.flatten()
        );
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Invalid request body',
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const {
        text,
        mode,
        style,
        provider,
        geminiApiKey,
        sambaNovaApiKey,
        geminiModel,
      } = parseResult.data;

      if (!text || text.length < 10) {
        return res.status(200).json({ suggestion: '' });
      }

      const suggestion = await withRetry(
        () =>
          generateTextCompletion(
            text,
            mode,
            style,
            provider,
            geminiApiKey,
            sambaNovaApiKey,
            geminiModel
          ),
        {
          maxRetries: MAX_RETRIES,
          retryDelay: RETRY_DELAY,
          timeout: DEFAULT_TIMEOUT,
          shouldRetry: isRetryableError,
        }
      );

      logger.info(`[${requestId}] Completion generated successfully`);
      res.status(200).json({ suggestion });
    } catch (error) {
      logger.error(`[${requestId}] Completion failed:`, error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      let statusCode = 500;
      let message = 'Internal server error';

      if (errorMessage.includes('timeout')) {
        statusCode = 504;
        message = 'Request timed out';
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('API key')
      ) {
        statusCode = 401;
        message = 'Invalid API key';
      } else if (
        errorMessage.includes('429') ||
        errorMessage.includes('rate limit')
      ) {
        statusCode = 429;
        message = 'Rate limit exceeded';
      }

      res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message,
        suggestion: '',
      });
    }
  });

  return app;
}
