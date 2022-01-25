import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { info } from 'src/bot/images';
import { FightService } from './fight.service';

@Controller('fight')
export class FightController {
	constructor(
		@Inject(FightService) private readonly fightService: FightService,
	) {}

	@Get('/:playerId')
	async getFight(@Param('playerId') playerId: string, @Res() res: Response) {
		const player = await this.fightService.getPlayer(
			BigInt(playerId) as unknown as number,
		);
		const img = info(player);

		res.setHeader('Content-Type', 'image/svg+xml');
		res.send(img);
	}
}
