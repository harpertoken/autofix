'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const vitest_1 = require('vitest');
const zod_1 = require('zod');
// Assuming schema.ts exports some schemas
// import { someSchema } from './schema';
(0, vitest_1.describe)('Schema validation', () => {
  (0, vitest_1.it)('validates basic string', () => {
    const schema = zod_1.z.string();
    (0, vitest_1.expect)(schema.safeParse('test').success).toBe(true);
    (0, vitest_1.expect)(schema.safeParse(123).success).toBe(false);
  });
  // Add more tests based on actual schemas
});
