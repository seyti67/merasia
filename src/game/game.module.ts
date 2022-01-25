import { Module } from '@nestjs/common';
import { InventoryModule } from 'src/inventory/inventory.module';
import { UserModule } from 'src/user/user.module';
import { FightModule } from './fights/fight.module';
import { FightService } from './fights/fight.service';

@Module({
	imports: [InventoryModule, UserModule, FightModule],
	providers: [FightService],
	exports: [FightService],
})
export class GameModule {}
