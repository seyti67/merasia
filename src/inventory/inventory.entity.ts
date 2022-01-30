import {
	BigIntType,
	Entity,
	JsonType,
	PrimaryKey,
	Property,
} from '@mikro-orm/core';

@Entity()
export class Inventory {
	// discord user id
	@PrimaryKey({ type: BigIntType, unique: true })
	id!: number;

	// items by id associated with amount
	@Property({ type: JsonType })
	items: { [key: number | string]: number } = {};

	// spells by id associated with level of spell
	@Property({ type: JsonType })
	spells: { [key: number]: number } = {};

	// equipped wand in format staff-stone$seed
	@Property()
	wand?: string;

	// equipped spells
	@Property({ type: JsonType })
	equippedSpells?: Array<[number, number]> = [[0, 1]]; // basic spell

	// farms
	@Property()
	tree = 0; // tree stage

	@Property()
	farmLevel = 1; // level of farm

	@Property()
	lastUpdate = Math.round(Date.now() / 1000); // last time the user updated their inventory (in seconds)
}
