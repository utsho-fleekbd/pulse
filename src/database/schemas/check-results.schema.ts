import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { monitors } from './monitors.schema.js';

export const checkResults = sqliteTable(
  'check_results',
  {
    id: text('id').primaryKey(),

    monitorId: text('monitor_id')
      .notNull()
      .references(() => monitors.id, {
        onDelete: 'cascade',
      }),

    status: text('status', {
      enum: ['up', 'down'],
    }).notNull(),
    statusCode: integer('status_code'),
    reason: text('reason', {
      enum: ['unhealthy_status', 'timeout', 'network_error'],
    }),
    responseTimeMs: integer('response_time_ms').notNull(),
    checkedAt: integer('checked_at', {
      mode: 'timestamp_ms',
    }).notNull(),
  },
  (table) => [
    index('check_results_monitor_time_idx').on(
      table.monitorId,
      table.checkedAt,
    ),
    check('check_results_status_check', sql`${table.status} IN ('up', 'down')`),
    check(
      'check_results_reason_check',
      sql`${table.reason} IS NULL OR ${table.reason} IN ('unhealthy_status', 'timeout', 'network_error')`,
    ),
  ],
);

export type CheckResultRow = typeof checkResults.$inferSelect;
export type NewCheckResultRow = typeof checkResults.$inferInsert;
