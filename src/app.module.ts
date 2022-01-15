import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		MikroOrmModule.forRoot({}),
		UserModule,
		AuthModule,
		InventoryModule,
	],
})
export class AppModule {}
