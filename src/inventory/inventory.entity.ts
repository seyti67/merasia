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

	// items
	@Property({ type: JsonType })
	items = {};

	@Property()
	slotsNb = 100;
}
