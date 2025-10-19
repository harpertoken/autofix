'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.textCompletionResponseSchema =
  exports.textCompletionRequestSchema =
  exports.insertUserSchema =
  exports.users =
    void 0;
const drizzle_orm_1 = require('drizzle-orm');
const pg_core_1 = require('drizzle-orm/pg-core');
const drizzle_zod_1 = require('drizzle-zod');
const zod_1 = require('zod');
exports.users = (0, pg_core_1.pgTable)('users', {
  id: (0, pg_core_1.varchar)('id')
    .primaryKey()
    .default((0, drizzle_orm_1.sql)`gen_random_uuid()`),
  username: (0, pg_core_1.text)('username').notNull().unique(),
  password: (0, pg_core_1.text)('password').notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(
  exports.users
).pick({
  username: true,
  password: true,
});
exports.textCompletionRequestSchema = zod_1.z.object({
  text: zod_1.z.string(),
  mode: zod_1.z.enum(['word', 'sentence', 'paragraph']).default('sentence'),
  style: zod_1.z
    .enum(['casual', 'formal', 'creative', 'technical'])
    .default('casual'),
});
exports.textCompletionResponseSchema = zod_1.z.object({
  suggestion: zod_1.z.string(),
});
