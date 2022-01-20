type spellEffect = 'burn' | 'freeze' | 'poison';

export interface Spell {
	name: string;
	cost: number;
	damage: number;
	type: 'normal' | 'fire' | 'water' | 'grass' | 'dark' | 'light';
	effect?: `${number}% ${spellEffect}`;
}

export const spells /* : { [key: string]: Spell } */ = {
	/* elemental spells */
	0: {
		name: 'hit',
		cost: 6,
		damage: 5,
		type: 'normal',
	},
	1: {
		name: 'fireball',
		cost: 10,
		damage: 10,
		type: 'fire',
		effect: '5% burn',
	},
	2: {
		name: 'ice spike',
		cost: 10,
		damage: 10,
		type: 'water',
		effect: '5% freeze',
	},
	3: {
		name: 'roots',
		cost: 10,
		damage: 10,
		type: 'grass',
		effect: '5% poison',
	},
};
