import { SeedManager } from '@mikro-orm/seeder';
import { defineConfig } from '@mikro-orm/sqlite';
import { Activity, Photo, Project, User } from './entities/index.js';

export default defineConfig({
  dbName: process.env.DB_NAME ?? 'care-dashboard.sqlite3',
  entities: [User, Project, Activity, Photo],
  extensions: [SeedManager],
  debug: process.env.ORM_DEBUG === 'true',
});
