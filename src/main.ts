import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.use(cookieParser());
	app.enableCors();
	await app.listen(process.env.PORT);
}
bootstrap();

/* import { getMobsAtFloor } from './game/floors';

for (let i = 0; i <= 1000; i++) {
	console.log(`Mob: ${getMobsAtFloor(0)}`);
} */
