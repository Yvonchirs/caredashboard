import { SeedManager } from '@mikro-orm/seeder';
import { defineConfig, NodeSqliteDialect, SqliteDriver } from '@mikro-orm/sql';
import { Activity, Photo, Project, User } from './entities/index.js';

const dbName = process.env.DB_NAME ?? 'care-dashboard.sqlite3';

export default defineConfig({
  driver: SqliteDriver,
  dbName,
  driverOptions: new NodeSqliteDialect(dbName),
  entities: [User, Project, Activity, Photo],
  extensions: [SeedManager],
  debug: process.env.ORM_DEBUG === 'true',
});
