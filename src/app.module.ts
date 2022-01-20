import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BotModule } from './bot/bot.module';
import { InventoryModule } from './inventory/inventory.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		MikroOrmModule.forRoot({}),
		UserModule,
		AuthModule,
		InventoryModule,
		BotModule,
	],
})
export class AppModule {}
