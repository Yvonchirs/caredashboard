import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/sqlite';
import config from './mikro-orm.config.js';
import { DatabaseSeeder, SEED_ADMIN, SEED_STAFF_PASSWORD } from './seeders/DatabaseSeeder.js';

const orm = await MikroORM.init(config);
try {
  await orm.schema.refresh();
  await orm.seeder.seed(DatabaseSeeder);
  console.log(`Database seeded.\n  Admin: ${SEED_ADMIN.email} / ${SEED_ADMIN.password}`);
  console.log(`  Staff: <firstname>@care.org.rw / ${SEED_STAFF_PASSWORD} (e.g. aline@care.org.rw)`);
} finally {
  await orm.close();
}
