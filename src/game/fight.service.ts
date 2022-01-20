import { Injectable } from '@nestjs/common';
import { MessageEmbed } from 'discord.js';
import { Monster } from './monsters';
import { Player, PlayerService } from './player.service';

interface Fight {
	monster: Monster;
	player: Player;
}

const heartsPerLine = 10;

@Injectable()
export class FightService {
	constructor(private playerService: PlayerService) {}
	private fights: { [key: number]: Fight } = {};

	public async addFight(
		interactionId: number,
		monster: Monster,
		player: number,
	) {
		const playerStats: Player = await this.playerService.getPlayer(player);
		this.fights[interactionId] = {
			monster,
			player: playerStats,
		};
		return { playerStats, monster };
	}

	async displayFight(interactionId: number) {
		const { monster, player } = this.fights[interactionId];
		function healthBar(health: number, maxHealth: number) {
			let bar = '';
			const fullHearts = Math.floor((health / maxHealth) * heartsPerLine);
			bar += '❤'.repeat(fullHearts);
			bar += Math.round(((health / maxHealth) % 1) * 4);
			bar += '💔'.repeat(heartsPerLine - fullHearts);
			return bar;
		}
		const embed = new MessageEmbed()
			.setTitle(`${monster.name} lvl ${monster.level}`)
			.setDescription(
				`${healthBar(monster.health, monster.maxHealth)}
				/n/n${healthBar(player.health, player.maxHealth)}`,
			)
			.setColor('#252525')
			.setThumbnail(
				process.env.URL +
					'assets/monsters/' +
					monster.name.replace(' ', '_') +
					'.png',
			);
		console.log(
			process.env.URL +
				'assets/monsters/' +
				monster.name.replace(' ', '_') +
				'.png',
		);
		return embed;
	}

	public async castSpell(slot: number, interactionId: number) {
		//
	}
}
