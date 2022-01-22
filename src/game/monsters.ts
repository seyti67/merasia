import type { Type } from './basics';

export interface MonsterData {
	health: number;
	damage: number;
	type: Type;
	level: number;
	loot?: number[];
}

export interface Monster {
	name: monsterName;
	type: Type;
	maxHealth: number;
	health: number;
	damage: number;
	level: number;
}

export const monsters /* : { [key: string]: MonsterData } */ = {
	'grass spirit': {
		health: 30,
		damage: 4,
		type: 'grass',
		level: 5,
	},
	'water spirit': {
		health: 25,
		damage: 5,
		type: 'water',
		level: 5,
	},
	'fire spirit': {
		health: 15,
		damage: 7,
		type: 'fire',
		level: 6,
	},
	'dark spirit': {
		health: 40,
		damage: 9,
		type: 'dark',
		level: 8,
	},
	'light spirit': {
		health: 35,
		damage: 12,
		type: 'light',
		level: 9,
	},
};

export type monsterName = keyof typeof monsters;

export default monsters;

export function getMob(mob: monsterName): Monster {
	const multipliers = [0.8 + 0.4 * Math.random(), 0.8 + 0.4 * Math.random()];
	// take the average of the multipliers
	const levelMultiplier = (multipliers[0] + multipliers[1]) / 2;
	const monster = monsters[mob];
	return {
		name: mob,
		type: monster.type as Type,
		health: Math.round(monster.health * multipliers[0]),
		maxHealth: Math.round(monster.health * multipliers[0]),
		damage: Math.round(monster.damage * multipliers[1]),
		level: Math.round(monster.level * levelMultiplier),
	};
}
