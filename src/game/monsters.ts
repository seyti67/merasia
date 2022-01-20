export interface MonsterData {
	health: number;
	damage: number;
	type: 'normal' | 'fire' | 'water' | 'grass' | 'dark' | 'light';
	level: number;
	loot?: number[];
}

export interface Monster {
	name: monsterName;
	maxHealth: number;
	health: number;
	damage: number;
	level: number;
}

export const monsters /* : { [key: string]: MonsterData } */ = {
	'grass spirit': {
		health: 30,
		damage: 2,
		type: 'grass',
		level: 5,
	},
	'water spirit': {
		health: 25,
		damage: 3,
		type: 'water',
		level: 5,
	},
	'fire spirit': {
		health: 15,
		damage: 5,
		type: 'fire',
		level: 6,
	},
	'dark spirit': {
		health: 35,
		damage: 5,
		type: 'dark',
		level: 8,
	},
	'light spirit': {
		health: 20,
		damage: 8,
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
		health: Math.round(monster.health * multipliers[0]),
		maxHealth: Math.round(monster.health * multipliers[0]),
		damage: Math.round(monster.damage * multipliers[1]),
		level: Math.round(monster.level * levelMultiplier),
	};
}
