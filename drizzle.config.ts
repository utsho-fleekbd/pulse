import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const filename = process.env.DB_FILE_NAME;

if (!filename) {
  throw new Error('DB_FILE_NAME is required');
}

export default defineConfig({
  schema: './src/database/schemas/*.schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: filename,
  },
});
