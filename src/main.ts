import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useStaticAssets(join(__dirname, '../../merasia-front', 'public'));
	app.use(compression());
	app.use(cookieParser());
	app.enableCors();
	await app.listen(process.env.PORT);
}
bootstrap();
