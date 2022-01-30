import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { InventoryModule } from 'src/inventory/inventory.module';
import { PlayerService } from './player.service';
import { InventoryController, UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
	imports: [MikroOrmModule.forFeature([User]), InventoryModule],
	controllers: [UserController, InventoryController],
	providers: [UserService, PlayerService],
	exports: [UserService, PlayerService],
})
export class UserModule {}
