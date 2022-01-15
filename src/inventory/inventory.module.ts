import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';

@Module({
	imports: [MikroOrmModule.forFeature([Inventory])],
	providers: [InventoryService],
	exports: [InventoryService],
})
export class InventoryModule {}
