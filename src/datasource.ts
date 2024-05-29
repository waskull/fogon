import { DataSource } from 'typeorm';
import { join } from 'path';

const connectionSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'waskull',
    password: '1234',
    database: 'fogon',
    synchronize: false,
    dropSchema: false,
    logging: false,
    logger: 'advanced-console',
    entities: [__dirname + '/../**/*.entities{.ts,.js}'],
    migrations: ['dist/migrations/*.js'],
    migrationsRun: false,
    migrationsTableName: 'migrations'
});

export default connectionSource;

