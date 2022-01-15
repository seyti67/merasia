import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import fetch from 'node-fetch';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: EntityRepository<User>,
		private readonly inventoryService: InventoryService,
	) {}
	async create(
		id: number,
		access_token: string,
		refresh_token: string,
	): Promise<User> {
		let user = await this.userRepository.findOne({ id });
		if (user) {
			// update
			user.accessToken = access_token;
			user.refreshToken = refresh_token;
			this.userRepository.flush();
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
		return user;
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

	async getUser(id: number): Promise<User> {
		const user = await this.userRepository.findOne({ id });
		if (!user) {
			throw new Error('User not found');
		}
		const userResult = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `Bearer ${user.accessToken}`,
			},
		});
		return userResult.json();
	}

	async getProperties(id: number): Promise<any> {
		const user = await this.userRepository.findOne({ id });
		return {
			level: user.level,
			xp: user.xp,
			upgradePoints: user.upgradePoints,
			health: user.health,
			mana: user.mana,
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
}
