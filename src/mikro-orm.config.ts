import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { join } from 'path';

const config: Options = {
	type: 'postgresql',
	clientUrl: process.env.DATABASE_URL,
	dbName: 'aperta',
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	metadataProvider: TsMorphMetadataProvider,
	migrations: {
		path: join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
		dropTables: true,
	},
};

export default config;
