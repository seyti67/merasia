import type { Effect, Type } from './basics';

export interface Spell {
	name: string;
	cost: number;
	damage: number;
	type: Type;
	effect?: `${number}% ${Effect}`;
	critical?: number;
}

export const spells: { [key: string]: Spell } = {
	/* elemental spells */
	0: {
		name: 'hit',
		cost: 5,
		damage: 3,
		type: 'normal',
	},
	1: {
		name: 'fireball',
		cost: 10,
		damage: 5,
		type: 'fire',
		effect: '5% burn',
	},
	2: {
		name: 'ice spike',
		cost: 10,
		damage: 5,
		type: 'water',
		effect: '5% freeze',
	},
	3: {
		name: 'roots',
		cost: 10,
		damage: 5,
		type: 'grass',
		effect: '5% poison',
	},
};
