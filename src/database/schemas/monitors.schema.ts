import { sql } from 'drizzle-orm';
import { check, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const monitors = sqliteTable(
  'monitors',
  {
    id: text('id').primaryKey(),

    name: text('name').notNull(),
    url: text('url').notNull(),
    status: text('status', {
      enum: ['pending', 'up', 'down'],
    })
      .notNull()
      .default('pending'),
  },
  (table) => [
    check(
      'monitors_status_check',
      sql`${table.status} IN ('pending', 'up', 'down')`,
    ),
  ],
);

export type MonitorRow = typeof monitors.$inferSelect;
export type NewMonitorRow = typeof monitors.$inferInsert;
