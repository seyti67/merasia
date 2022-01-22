import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Inventory } from './inventory.entity';

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

	async addItem(id: number, item: number, amount: number) {
		const inventory = await this.inventoryRepository.findOne({ id });
		if (!inventory) {
			throw new Error('Inventory not found');
		}
		if (!inventory.items[item]) {
			inventory.items[item] = amount;
		} else {
			inventory.items[item] += amount;
		}
		this.inventoryRepository.flush();
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
		const wand = inventory.wand || '';
		return { wand, spells };
	}

	async reset() {
		await this.inventoryRepository.removeAndFlush(
			await this.inventoryRepository.findAll(),
		);
	}
}
