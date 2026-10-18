import { drizzle } from 'drizzle-orm/node-sqlite';

export function createDatabase(filename: string) {
  return drizzle(filename);
}

export type Database = ReturnType<typeof createDatabase>;
