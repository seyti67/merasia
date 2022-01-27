import { Injectable } from '@nestjs/common';
import {
	ColorResolvable,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import { getSpellDamage, Hit, randomizeDamage } from './fights';
import type { Monster } from '../data/monsters';
import { Spell, spells } from '../data/spells';
import { Player, PlayerService } from 'src/user/player.service';
import { hearts, manas } from '../data/emojis';

interface Fight {
	monster: Monster;
	player: Player;
	messages: string[];
	fighting: boolean;
	xp?: number;
	loot?: number[];
	color?: ColorResolvable;
}

const pointsPerLine = 10;
function bar(value: number, max: number, fragments: string[]) {
	let bar = '';
	const part = (value / max) * pointsPerLine;
	const full = Math.floor(part);
	bar += fragments[fragments.length - 1].repeat(full);

	let remains =
		Math.floor((part % 1) * (fragments.length - 1) + 1) % pointsPerLine;
	if (value === max) remains = 0;
	if (remains !== 0) bar += fragments[remains - 1];

	bar += fragments[0].repeat(
		Math.max(0, pointsPerLine - full - (remains !== 0 ? 1 : 0)),
	);
	return bar;
}

@Injectable()
export class FightService {
	constructor(private playerService: PlayerService) {}
	private fights: { [key: number]: Fight } = {};

	async addFight(monster: Monster, playerId: number) {
		const playerStats: Player = await this.playerService.getStats(playerId);
		this.fights[playerId] = {
			monster,
			player: playerStats,
			messages: [`Fight started with ${monster.name}!`],
			fighting: false,
		};
		return { playerStats, monster };
	}

	start(playerId: number) {
		this.fights[playerId].fighting = true;
	}

	async win(playerId: number) {
		const fight = this.fights[playerId];
		const { monster, player } = fight;
		fight.fighting = false;
		fight.color = '#3b9b41';
		const xp = Math.round(
			(((0.5 + Math.random()) * monster.level) / player.level) * 10,
		);
		fight.xp = xp;
		const levelGain = await this.playerService.addXp(playerId, xp);
		fight.messages = ['You won!', `You gained ${xp} xp`];
		if (levelGain) {
			fight.messages.push(
				levelGain < 2
					? 'You gained a level!'
					: `You gained ${levelGain} levels!`,
			);
		}
	}

	lose(playerId: number) {
		const fight = this.fights[playerId];
		fight.fighting = false;
		fight.color = '#d6332a';
		fight.messages = [
			'You lost!',
			'You now have negative health and must wait.',
		];
		fight.player.health = -fight.player.maxHealth;
	}

	remove(playerId: number) {
		delete this.fights[playerId];
	}

	getFighters(playerId: number) {
		const { monster, player } = this.fights[playerId];
		return { monster, player };
	}

	async getPlayer(playerId: number): Promise<Player> {
		const fight = this.fights[playerId];
		let player: Player;
		if (!fight) {
			player = await this.playerService.getStats(playerId);
		} else {
			player = fight.player;
		}
		return player;
	}

	exists(playerId: number) {
		return this.fights[playerId] && this.fights[playerId].fighting;
	}

	async round(playerId: number) {
		const fight = this.fights[playerId];
		const { monster, player } = fight;

		if (monster.health <= 0) {
			monster.health = 0;
			await this.win(playerId);
			return;
		}

		const monsterHit = randomizeDamage(monster.damage);
		fight.messages.push(`${monster.name} dealt ${monsterHit.damage} damage`);
		player.health -= monsterHit.damage;
		player.health = Math.max(0, player.health);
		if (player.health <= 0) {
			fight.messages.push('Lmao you died');
			this.lose(playerId);
		}

		this.playerService.setPoints(playerId, {
			health: player.health,
			mana: player.mana,
		});
	}

	castSpell(slot: number, playerId: number) {
		const fight = this.fights[playerId];
		if (!fight || !fight.fighting) return;
		const player = fight.player;
		const spellData = player.spells[slot];
		const spell: Spell = spells[spellData[0]];

		player.mana -= spell.cost;
		const hit: Hit = getSpellDamage(
			spellData[0],
			spellData[1],
			player.wand,
			fight.monster,
		);
		fight.messages = [
			`You've dealt ${hit.damage} damage${
				hit.critical ? ', critical hit!' : '.'
			}`,
		];
		fight.monster.health -= hit.damage;
	}

	skip(playerId: number) {
		const fight = this.fights[playerId];
		fight.messages = [`You skipped a round`];
	}

	display(playerId: number): {
		embeds: MessageEmbed[];
		components: MessageActionRow[];
	} {
		const fight = this.fights[playerId];
		const { monster, player } = fight;

		if (!fight.fighting) {
			const embed = new MessageEmbed()
				.setTitle('The fight is over')
				.setDescription(fight.messages.join('\n'))
				.setColor(fight.color || '#252525');
			this.remove(playerId);
			return { embeds: [embed], components: [] };
		}

		console.log(player.mana, player.maxMana);
		const embed = new MessageEmbed()
			.setTitle(`${monster.name} level ${monster.level}`)
			.setDescription(
				`${bar(monster.health, monster.maxHealth, hearts)}\n\n` +
					fight.messages.join('\n') +
					`\n\n${bar(player.health, player.maxHealth, hearts)}` +
					`\n${bar(player.mana, player.maxMana, manas)}`,
			)
			.setColor(fight.color || '#252525');
		embed.thumbnail = {
			url:
				'https://merasia.duianaft.repl.co/monsters/' +
				monster.name.replace(' ', '_') +
				'.png',
		};

		const row = new MessageActionRow();
		let index = 0;
		for (const spell in player.spells) {
			row.addComponents(
				new MessageButton()
					.setCustomId('spell-' + index)
					.setLabel(`${spells[spell].name} (${spells[spell].cost})`)
					.setStyle('PRIMARY')
					.setDisabled(player.mana < spells[spell].cost),
			);
			index++;
		}
		row.addComponents(
			new MessageButton()
				.setCustomId('skip')
				.setLabel('Skip')
				.setStyle('SECONDARY'),
		);
		return { embeds: [embed], components: [row] };
	}
}
