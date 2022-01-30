import type { WandStats } from './wands';
import type { Type } from './basics';

type Category = 'item' | 'staff' | 'stone';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface Item {
	name: string;
	description: string;
	category: Category;
	rarity: Rarity;
	stats?: WandStats;
	type?: Type;
}

export const items: { [key: number]: Item } = {
	// 1-5 stone fragments
	// 6-30 elemental stones
	// --- logs --- //
	31: {
		name: 'Populus log',
		description: 'This log is the base wood for weak staffs.',
		category: 'item',
		rarity: 'common',
	},
	32: {
		name: 'Oak log',
		description: 'This log is the base wood for strong staffs.',
		category: 'item',
		rarity: 'uncommon',
	},
	33: {
		name: 'Bloody dogwood log',
		description: 'This log is the base wood for powerful staffs.',
		category: 'item',
		rarity: 'rare',
	},
	34: {
		name: 'Brazil wood log',
		description: 'This log is the base wood for fancy staffs.',
		category: 'item',
		rarity: 'epic',
	},
	35: {
		name: 'Snakewood log',
		description: 'This log is the base wood for legendary staffs.',
		category: 'item',
		rarity: 'legendary',
	},
	36: {
		name: 'weak staff',
		description: "I mean... It's wood, but it's still a staff.",
		category: 'staff',
		rarity: 'common',
		stats: {
			damage: 1,
			mana: 0,
			manaRegen: 2,
			health: 0,
			healthRegen: 2,
		},
	},
	37: {
		name: 'staff',
		description: "A simple staff. Not powerful, but it's better than nothing.",
		category: 'staff',
		rarity: 'uncommon',
		stats: {
			damage: 1.3,
			mana: 10,
			manaRegen: 5,
			health: 10,
			healthRegen: 5,
		},
	},
	38: {
		name: 'great staff',
		description: "A staff that's better than a normal staff.",
		category: 'staff',
		rarity: 'rare',
		stats: {
			damage: 1.5,
			mana: 30,
			manaRegen: 15,
			health: 30,
			healthRegen: 15,
		},
	},
	39: {
		name: 'fancy staff',
		description: 'Woah, this staff is quite powerful!',
		category: 'staff',
		rarity: 'epic',
		stats: {
			damage: 2,
			mana: 50,
			manaRegen: 25,
			health: 50,
			healthRegen: 25,
		},
	},
	40: {
		name: 'legendary staff',
		description: "This staff is the best staff you've ever seen!",
		category: 'staff',
		rarity: 'legendary',
		stats: {
			damage: 2.5,
			mana: 100,
			manaRegen: 50,
			health: 100,
			healthRegen: 50,
		},
	},
};

const elements = ['grass', 'water', 'fire', 'dark', 'light'];
elements.forEach((element: Type, i) => {
	items[1 + i] = {
		name: `${element} stone`,
		description: `A stone fragment from the ${element} element.`,
		category: 'item',
		rarity: 'common',
	};
	items[6 + i] = {
		name: `ugly ${element} stone`,
		description: `A stone from the ${element} element. It's ugly and weak.`,
		category: 'stone',
		rarity: 'common',
		type: element,
	};
	items[11 + i] = {
		name: `${element} stone`,
		description: `A stone from the ${element} element. It's quite basic.`,
		category: 'stone',
		rarity: 'uncommon',
		type: element,
	};
	items[16 + i] = {
		name: `fancy ${element} stone`,
		description: `A stone from the ${element} element. It's very fancy.`,
		category: 'stone',
		rarity: 'rare',
		type: element,
	};
	items[21 + i] = {
		name: `wonderful ${element} stone`,
		description: `A stone from the ${element} element. It's very wonderful.`,
		category: 'stone',
		rarity: 'epic',
		type: element,
	};
	items[26 + i] = {
		name: `Perfect ${element} stone`,
		description: `A stone from the ${element} element. It's just perfect and very powerful.`,
		category: 'stone',
		rarity: 'legendary',
		type: element,
	};
});
