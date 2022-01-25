import { Module } from '@nestjs/common';
import { InventoryModule } from 'src/inventory/inventory.module';
import { UserModule } from 'src/user/user.module';
import { FightService } from './fight.service';

@Module({
	imports: [InventoryModule, UserModule],
	providers: [FightService],
	exports: [FightService],
})
export class GameModule {}
