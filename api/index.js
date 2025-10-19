// apps/server/index.ts
import 'dotenv/config';
import express2 from 'express';
import { createServer } from 'http';

// apps/server/gemini.ts
import { GoogleGenAI as GoogleGenAI2 } from '@google/genai';

// packages/shared/gemini.ts
import { GoogleGenAI } from '@google/genai';

// packages/shared/prompts.ts
function buildSystemPrompt(mode, style) {
  let systemPrompt = '';
  switch (mode) {
    case 'word':
      systemPrompt =
        "You are a helpful writing assistant. Complete the user's text with the next 1-3 words that would naturally follow. Be concise and contextually appropriate.";
      break;
    case 'sentence':
      systemPrompt =
        "You are a helpful writing assistant. Continue the user's text with the next sentence or complete their current sentence naturally.";
      break;
    case 'paragraph':
      systemPrompt =
        "You are a helpful writing assistant. Expand on the user's text with a full paragraph that continues their ideas logically.";
      break;
  }
  switch (style) {
    case 'formal':
      systemPrompt += ' Use formal, professional language.';
      break;
    case 'creative':
      systemPrompt +=
        ' Use creative, expressive language with vivid descriptions.';
      break;
    case 'technical':
      systemPrompt +=
        ' Use precise, technical language appropriate for documentation or technical writing.';
      break;
    case 'casual':
    default:
      systemPrompt += ' Use casual, conversational language.';
      break;
  }
  systemPrompt +=
    " Do NOT repeat the user's text. Only provide the continuation. Keep it brief and natural.";
  return systemPrompt;
}

// packages/shared/gemini.ts
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
async function generateTextCompletion(
  currentText,
  mode = 'sentence',
  style = 'casual',
  model = 'gemini-2.0-flash'
) {
  console.log('Generating text completion for:', { currentText, mode, style });
  try {
    const systemPrompt = buildSystemPrompt(mode, style);
    const response = await ai.models.generateContent({
      model,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: mode === 'word' ? 10 : mode === 'sentence' ? 50 : 150,
      },
      contents: currentText,
    });
    const suggestion = response.text?.trim() || '';
    if (!suggestion) {
      return '';
    }
    if (mode === 'word' && !currentText.endsWith(' ')) {
      return suggestion;
    }
    console.log('Generated suggestion:', suggestion);
    return suggestion.startsWith(' ') ? suggestion : ' ' + suggestion;
  } catch (error) {
    console.error('Generation error:', error);
    return '';
  }
}

// apps/server/gemini.ts
var ai2 = new GoogleGenAI2({ apiKey: process.env.GEMINI_API_KEY || '' });
async function testApiKey() {
  try {
    console.log('Testing API key...');
    if (!process.env.GEMINI_API_KEY) {
      console.log('No API key set');
      return false;
    }
    const response = await ai2.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: 'Respond with "ok"',
        temperature: 0,
        maxOutputTokens: 5,
      },
      contents: 'Hello world',
    });
    const result = !!response.text?.trim();
    console.log('Test result:', result);
    return result;
  } catch (error) {
    console.log('Test failed:', error);
    return false;
  }
}

// packages/shared/schema.ts
import { sql } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
var users = pgTable('users', {
  id: varchar('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

var textCompletionRequestSchema = z.object({
  text: z.string(),
  mode: z.enum(['word', 'sentence', 'paragraph']).default('sentence'),
  style: z
    .enum(['casual', 'formal', 'creative', 'technical'])
    .default('casual'),
});
var textCompletionResponseSchema = z.object({
  suggestion: z.string(),
});

// apps/server/routes.ts
function registerRoutes(app2) {
  app2.get('/api/status', async (req, res) => {
    try {
      const isWorking = await testApiKey();
      console.log('Status check result:', isWorking);
      res.json({ status: isWorking ? 'ok' : 'error' });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ status: 'error' });
    }
  });
  app2.post('/api/complete', async (req, res) => {
    try {
      const {
        text: text2,
        mode,
        style,
      } = textCompletionRequestSchema.parse(req.body);
      if (!text2 || text2.length < 10) {
        return res.json({ suggestion: '' });
      }
      const suggestion = await generateTextCompletion(text2, mode, style);
      res.json({ suggestion });
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ suggestion: '' });
    }
  });
  return app2;
}

// apps/server/vite.ts
import express from 'express';
import fs from 'fs';
import path2 from 'path';
import { createServer as createViteServer, createLogger } from 'vite';

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/client/src'),
      '@shared': path.resolve(__dirname, 'packages/shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  root: 'apps/client',
  publicDir: 'public',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'apps/client/index.html'),
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});

// apps/server/vite.ts
import { nanoid } from 'nanoid';
var viteLogger = createLogger();
function log(message, source = 'express') {
  const formattedTime = /* @__PURE__ */ new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: 'custom',
  });
  app2.use(vite.middlewares);
  app2.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        '../..',
        'apps/client',
        'index.html'
      );
      let template = await fs.promises.readFile(clientTemplate, 'utf-8');
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, 'public');
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use('*', (_req, res) => {
    res.sendFile(path2.resolve(distPath, 'index.html'));
  });
}

// apps/server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path3.startsWith('/api')) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '\u2026';
      }
      log(logLine);
    }
  });
  next();
});
var configuredApp = registerRoutes(app);
configuredApp.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
});
if (configuredApp.get('env') === 'development') {
  const server = createServer(configuredApp);
  setupVite(configuredApp, server);
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(
    {
      port,
      host: '0.0.0.0',
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
} else {
  serveStatic(configuredApp);
  if (!process.env.VERCEL) {
    const server = createServer(configuredApp);
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen(
      {
        port,
        host: '0.0.0.0',
      },
      () => {
        log(`serving on port ${port}`);
      }
    );
  }
}
var index_default = configuredApp;
export { index_default as default };
