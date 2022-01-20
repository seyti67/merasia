import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

export interface Player {
	id: number;
	health: number;
	maxHealth: number;
	mana: number;
	maxMana: number;
	wand?: number | string;
	spells: Array<[number, number]>;
}

@Injectable()
export class PlayerService {
	constructor(private readonly userService: UserService) {}

	async getPlayer(playerId: number): Promise<Player> {
		return this.userService.getStats(playerId);
	}
}
