import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { getWand, Wand } from "src/game/data/wands";
import { xpUntilNext } from "src/game/utils";
import { InventoryService } from "src/inventory/inventory.service";
import { User } from "./user.entity";

export interface Player {
	id: number;
	level: number;
	health: number;
	maxHealth: number;
	mana: number;
	maxMana: number;
	xp: number;
	wand?: Wand;
	spells: Array<[number, number]>;
}

interface Identity {
    id: number,
    username: string,
    avatar: string, 
    discriminator: string,
    level: number,
    xp: number,
    health: number,
    maxHealth: number,
    mana: number,
    maxMana: number,
}

const playersPoints: {
	[key: number]: {
		health: number;
		maxHealth: number;
		mana: number;
		maxMana: number;
		lastUpdate: number;
	};
} = {};

interface BasicPlayer {
	id: number;
	maxHealth: number;
	maxMana: number;
}

const min = Math.min;

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(User)
		private userRepository: EntityRepository<User>,
        private readonly inventoryService: InventoryService
    ) {}

    async getBasicPlayer(id: number): Promise<BasicPlayer> {
		const user = await this.userRepository.findOne({ id });
		return {
			id: user.id,
			maxHealth: user.maxHealth,
			maxMana: user.maxMana,
		};
	}

	async getUserData(id: number): Promise<Identity> {
		if (playersPoints[id]) this.updatePoints(id); // update the points if someone wants to see them
		const user = await this.userRepository.findOne({ id });
		if (!user) {
			throw new Error('User not found');
		}
		const userResult = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${user.accessToken}`,
			},
		}); // get the user data from the discord api
		const userData = await userResult.json();
		const player = playersPoints[id]; //
		return {
			id: userData.id,
			username: userData.username,
			avatar: userData.avatar, 
			discriminator: userData.discriminator,
			level: user.level,
			xp: user.xp,
			health: player ? player.health : user.maxHealth,
			maxHealth: user.maxHealth,
			mana: player ? player.mana : user.maxMana,
			maxMana: user.maxMana,
		};
	}

	async getProperties(id: number): Promise<any> {
		const user = await this.userRepository.findOne({ id });
		const player = playersPoints[id];
		return {
			level: user.level,
			xp: user.xp,
			upgradePoints: user.upgradePoints,
			health: player ? player.health : user.maxHealth,
			mana: player ? player.mana : user.maxMana,
		};
	}

	async updatePoints(id: number) {
		const player = playersPoints[id];
		if (!player) {
			const user = await this.getBasicPlayer(id);
			playersPoints[id] = {
				health: user.maxHealth,
				maxHealth: user.maxHealth,
				mana: user.maxMana,
				maxMana: user.maxMana,
				lastUpdate: Date.now(),
			};
		} else {
			// difference in minutes
			const diff = (Date.now() - player.lastUpdate) / 1000 / 60;
			const wand = getWand(await this.inventoryService.getWand(id));
			if (!wand) return;
			player.health = min(
				player.health + wand.stats.healthRegen * Math.floor(diff),
				player.maxHealth,
			);
			player.mana = min(
				player.mana + wand.stats.manaRegen * Math.floor(diff),
				player.maxMana,
			);
			player.lastUpdate = Date.now() - (diff % 1) * 60 * 1000; // take the rest of the minutes
			if (
				player.health === player.maxHealth &&
				player.mana === player.maxMana
			) {
				delete playersPoints[id];
			}
		}
		this.userRepository.flush();
		return;
	}

	async setPoints(id: number, points: { health: number; mana: number }) {
		const player = playersPoints[id];
		player.health = points.health;
		player.mana = points.mana;
	}

	async getStats(id: number): Promise<Player> {
		await this.updatePoints(id);
		const user = await this.userRepository.findOne({ id });
		const equipped = await this.inventoryService.getEquipped(id);
		const player = playersPoints[id];
		return {
			id,
			level: user.level,
			xp: user.xp,
			maxHealth: user.maxHealth,
			health: player ? player.health : user.maxHealth,
			maxMana: user.maxMana,
			mana: player ? player.mana : user.maxMana,
			wand: getWand(equipped.wand),
			spells: equipped.spells,
		};
	}
    
    async addXp(id: number, xp: number): Promise<number> {
		const user = await this.userRepository.findOne({ id });
		let xpToAdd = xp;
		let levelGain = 0;
		while (user.xp + xpToAdd > xpUntilNext(user.level + 1)) {
			user.level++;
			levelGain++;
			user.upgradePoints += 5;
			xpToAdd -= xpUntilNext(user.level);
		}
		user.xp += xpToAdd;
		await this.userRepository.flush();
		return levelGain;
	}
}