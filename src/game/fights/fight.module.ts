import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { FightController } from './fight.controller';
import { FightService } from './fight.service';

@Module({
	imports: [UserModule],
	controllers: [FightController],
	providers: [FightService],
	exports: [FightService],
})
export class FightModule {}
