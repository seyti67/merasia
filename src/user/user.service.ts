import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import fetch from 'node-fetch';
import { InventoryService } from '../inventory/inventory.service';
import { getWand, Wand } from 'src/game/data/wands';
import { xpUntilNext } from 'src/game/utils';

const min = Math.min;

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

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: EntityRepository<User>,
		private readonly inventoryService: InventoryService,
	) {}
	async create(id: number, access_token: string, refresh_token: string) {
		let user = await this.userRepository.findOne({ id });
		if (user) {
			if (
				user.accessToken !== access_token &&
				user.refreshToken !== refresh_token
			) {
				// update
				user.accessToken = access_token;
				user.refreshToken = refresh_token;
				this.userRepository.flush();
			}
		} else {
			// create inventory
			await this.inventoryService.create(id);
			// create
			user = this.userRepository.create({
				id,
				accessToken: access_token,
				refreshToken: refresh_token,
			});
			this.userRepository.persistAndFlush(user);
		}
	}

	async refreshToken(id: number): Promise<User> {
		const user = await this.userRepository.findOne({ id });
		if (!user) {
			throw new Error('User not found');
		}
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'post',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
			},
			body: new URLSearchParams({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				grant_type: 'refresh_token',
				refresh_token: user.refreshToken,
			}),
		});
		if (response.status !== 200) {
			throw new Error('Failed to refresh token');
		}
		const { access_token, refresh_token } = await response.json();
		user.accessToken = access_token;
		user.refreshToken = refresh_token;
		this.userRepository.flush();
		return user;
	}

	async getBasicPlayer(id: number): Promise<BasicPlayer> {
		const user = await this.userRepository.findOne({ id });
		return {
			id: user.id,
			maxHealth: user.maxHealth,
			maxMana: user.maxMana,
		};
	}

	async getUserData(id: number) {
		if (playersPoints[id]) this.updatePoints(id);
		const user = await this.userRepository.findOne({ id });
		if (!user) {
			throw new Error('User not found');
		}
		const userResult = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${user.accessToken}`,
			},
		});
		const userData = await userResult.json();
		const player = playersPoints[id];
		const allData = {
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
		return allData;
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

	async getUsers(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async reset(): Promise<void> {
		await this.userRepository.removeAndFlush(
			await this.userRepository.findAll(),
		);
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
