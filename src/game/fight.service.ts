import { Injectable } from '@nestjs/common';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { getSpellDamage, Hit, randomizeDamage } from './fights';
import type { Monster } from './monsters';
import { Player, PlayerService } from './player.service';
import { Spell, spells } from './spells';
import type { WandStats } from './wands';

interface Fight {
	monster: Monster;
	player: Player;
	messages: string[];
	fighting: boolean;
	xp?: number;
	lost?: boolean;
	loot?: number[];
}

const pointsPerLine = 10;
function healthBar(health: number, maxHealth: number) {
	let bar = '';
	const fullHearts = Math.floor((health / maxHealth) * pointsPerLine);
	bar += '❤'.repeat(fullHearts);
	const fragments = Math.round(((health / maxHealth) % 1) * 4);
	bar += fragments ? fragments : '';
	bar += '🤍'.repeat(pointsPerLine - fullHearts);

	bar += ` ${health} pv`;
	return bar;
}
function manaBar(mana: number, maxMana: number) {
	let bar = '';
	const fullMana = Math.floor((mana / maxMana) * pointsPerLine);
	bar += '🔵'.repeat(fullMana);
	const fragments = Math.round(((mana / maxMana) % 1) * 4);
	bar += fragments ? fragments : '';
	bar += '⚪'.repeat(pointsPerLine - fullMana);

	bar += ` ${mana} mp`;
	return bar;
}

@Injectable()
export class FightService {
	constructor(private playerService: PlayerService) {}
	private fights: { [key: number]: Fight } = {};

	async addFight(monster: Monster, playerId: number) {
		const playerStats: Player = await this.playerService.getPlayer(playerId);
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

	end(playerId: number) {
		const fight = this.fights[playerId];
		const { monster, player } = fight;
		fight.fighting = false;
		const xp = (((0.5 + Math.random()) * monster.level) / player.level) * 100;
		fight.xp = Math.round(xp);
	}

	remove(playerId: number) {
		delete this.fights[playerId];
	}

	getFighters(playerId: number) {
		const { monster, player } = this.fights[playerId];
		return { monster, player };
	}

	exists(playerId: number) {
		return this.fights[playerId] && this.fights[playerId].fighting;
	}

	display(playerId: number): {
		embeds: MessageEmbed[];
		components: MessageActionRow[];
	} {
		const fight = this.fights[playerId];
		const { monster, player } = fight;

		if (!fight.fighting) {
			const embed = new MessageEmbed()
				.setTitle(`${monster.name} defeated!`)
				.setDescription(`You looted ${fight.xp} xp.`)
				.setColor('#00aa00');
			this.remove(playerId);
			return { embeds: [embed], components: [] };
		}

		const embed = new MessageEmbed()
			.setTitle(`${monster.name} lvl ${monster.level}`)
			.setDescription(
				`${healthBar(monster.health, monster.maxHealth)}

				${fight.messages.join('\n')}

				${healthBar(player.health, player.maxHealth)}
				${manaBar(player.mana, player.maxMana)}`,
			)
			.setColor('#252525');
		embed.thumbnail = {
			url:
				'https://merasia.duianaft.repl.co/monsters/' +
				monster.name.replace(' ', '_') +
				'.png',
			width: 256,
			height: 256,
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

	round(playerId: number) {
		const fight = this.fights[playerId];
		const { monster, player } = fight;

		if (monster.health <= 0) {
			monster.health = 0;
			fight.messages = [`You killed ${fight.monster.name}`];
			this.end(playerId);
			return;
		}

		const stats: WandStats = player.wand.stats;
		const monsterHit = randomizeDamage(monster.damage);
		fight.messages.push(`${monster.name} dealt ${monsterHit.damage} damage`);
		player.health -= monsterHit.damage;
		if (player.health <= 0) {
			fight.messages.push('Lmao you died');
			fight.lost = true;
			this.end(playerId);
			return;
		}

		const hRegen = Math.min(
			stats.healthRegen,
			player.maxHealth - player.health,
		);
		player.health += hRegen;

		const mRegen = Math.min(stats.manaRegen, player.maxMana - player.mana);
		player.mana += mRegen;

		fight.messages.push(
			`Regeneration: ${hRegen ? `+${hRegen} pv` : ''} ${
				mRegen ? `+${mRegen} mp` : ''
			}`,
		);
	}

	castSpell(slot: number, playerId: number) {
		const fight = this.fights[playerId];
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
}
