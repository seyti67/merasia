import type { Type } from './basics';
import { items } from './items';
export interface WandStats {
	damage: number;
	mana: number;
	manaRegen: number;
	health: number;
	healthRegen: number;
}

export interface Wand {
	type: Type;
	stats: WandStats;
}

function GaussianFrom(seed: number) {
	function mulberry32(a: number) {
		let t = (a += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}
	let total = 0;
	for (let i = 0; i < 5; i++) {
		total += mulberry32(seed + i);
	}
	return total / 5;
}

export function getWand(id: string): Wand {
	//split on '-' and '$'
	const [staff, stone, seed] = id.split(/[-\$]/).map(Number);
	const baseStats: WandStats = items[staff].stats;
	// random stats generated with seed
	// stats are in a range of 70% - 160%
	const stats: WandStats = {} as WandStats;
	let index = 0;
	for (const stat in baseStats) {
		stats[stat] = Math.round(
			baseStats[stat] * (0.7 + GaussianFrom(seed + index) * 0.4),
		);
		index++;
	}

	return {
		type: items[stone].type as Type,
		stats,
	};
}
