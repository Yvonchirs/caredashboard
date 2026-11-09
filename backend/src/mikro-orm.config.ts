import { SeedManager } from '@mikro-orm/seeder';
import { defineConfig } from '@mikro-orm/sqlite';
import { Activity, Notice, Photo, Project, User, WorkStatus } from './entities/index.js';

export default defineConfig({
  dbName: process.env.DB_NAME ?? 'care-dashboard.sqlite3',
  entities: [User, Project, Activity, Photo, Notice, WorkStatus],
  extensions: [SeedManager],
  debug: process.env.ORM_DEBUG === 'true',
});
