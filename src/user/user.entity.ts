import { BigIntType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
	@PrimaryKey({ unique: true, type: BigIntType })
	id!: number; // discord id

	/* auth properties */
	@Property({ length: 30 })
	accessToken?: string;

	@Property({ length: 30 })
	refreshToken?: string;

	/* game properties */
	@Property()
	level = 0;

	@Property()
	xp = 0;

	@Property()
	upgradePoints = 0;

	@Property()
	maxHealth = 100;

	@Property()
	maxMana = 100;
}
