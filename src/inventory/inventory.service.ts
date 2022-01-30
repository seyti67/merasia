import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { getTree } from 'src/game/data/trees';
import { Inventory } from './inventory.entity';

const treeStages = 4;
const updateInterval = 60 * 60;

@Injectable()
export class InventoryService {
	constructor(
		@InjectRepository(Inventory)
		private inventoryRepository: EntityRepository<Inventory>,
	) {}

	async create(id: number) {
		const inventory = this.inventoryRepository.create({ id });
		await this.inventoryRepository.persistAndFlush(inventory);
		return;
	}

	async addItem(inventory: Inventory, item: number, amount: number) {
		if (!inventory.items[item]) {
			inventory.items[item] = amount;
		} else {
			inventory.items[item] += amount;
		}
		await this.inventoryRepository.flush();
	}

	async removeItem(id: number, item: number, amount: number): Promise<boolean> {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		if (!inventory.items[item]) {
			return false;
		} else if (inventory.items[item] < amount) {
			return false;
		}
		inventory.items[item] -= amount;
		if (inventory.items[item] === 0) {
			delete inventory.items[item];
		}
		this.inventoryRepository.flush();
		return true;
	}

	async getItems(id: number): Promise<{ [key: number]: number }> {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		return inventory.items;
	}

	async getEquipped(
		id: number,
	): Promise<{ wand: string | string; spells: Array<[number, number]> }> {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		const spells = inventory.equippedSpells;
		const wand = inventory.wand;
		return { wand, spells };
	}

	async getWand(id: number): Promise<string> {
		const inventory = await this.inventoryRepository.findOne(
			{ id },
			{ fields: ['wand'] },
		);
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		return inventory.wand;
	}

	async update(inventory: Inventory) {
		if (!inventory.lastUpdate)
			inventory.lastUpdate = Math.round(Date.now() / 1000);
		// difference in time in half-hours
		const diff = (Date.now() / 1000 - inventory.lastUpdate) / updateInterval;
		if (diff > 1) {
			inventory.lastUpdate = Math.round(
				Date.now() / 1000 - (diff % 1) * updateInterval,
			);
			inventory.tree = Math.min(inventory.tree + Math.floor(diff), treeStages);
		}
		this.inventoryRepository.flush();
	}

	async getEverything(id: number): Promise<Inventory> {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		this.update(inventory);
		return inventory;
	}

	async collectTree(id: number) {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		if (inventory.tree !== treeStages) return;

		inventory.tree = 0;
		this.inventoryRepository.flush();

		return getTree(inventory.farmLevel);
	}

	async reset() {
		await this.inventoryRepository.removeAndFlush(
			await this.inventoryRepository.findAll(),
		);
	}
}
