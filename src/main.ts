import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

const httpsOptions = {
	key: fs.readFileSync('server.key', 'utf-8'),
	cert: fs.readFileSync('server.cert', 'utf-8'),
};

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		httpsOptions,
	});
	app.useStaticAssets(join(__dirname, '../public'));
	app.use(compression());
	app.use(cookieParser());
	app.enableCors();
	await app.listen(process.env.PORT || 3000);
}
bootstrap();
