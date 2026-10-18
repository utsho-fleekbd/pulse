import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/node-sqlite';

export function createDatabase(filename: string) {
  const client = new DatabaseSync(filename);

  client.exec('PRAGMA foreign_keys = ON');

  return drizzle({ client });
}

export type Database = ReturnType<typeof createDatabase>;
