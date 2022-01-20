import { Module } from '@nestjs/common';
import { InventoryModule } from 'src/inventory/inventory.module';
import { UserModule } from 'src/user/user.module';
import { FightService } from './fight.service';
import { PlayerService } from './player.service';

@Module({
	imports: [InventoryModule, UserModule],
	providers: [PlayerService, FightService],
	exports: [PlayerService, FightService],
})
export class GameModule {}
