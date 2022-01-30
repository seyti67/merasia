import { weaknesses } from '../data/basics';
import type { Monster } from '../data/monsters';
import { Spell, spells } from '../data/spells';
import type { Wand } from '../data/wands';

export interface Hit {
	damage: number;
	critical: boolean;
}

export function getSpellDamage(
	spellId: number,
	level: number,
	wand: Wand,
	target: Monster,
): Hit {
	const spell: Spell = spells[spellId];
	let damage = spell.damage;
	damage *= wand.stats.damage;
	damage *= 1 + level / 5;
	damage *= wand.type === spell.type ? 1.2 : 1;
	if (weaknesses[target.type] === spell.type) {
		damage *= 1.5;
	} else if (weaknesses[spell.type] === target.type) {
		damage *= 0.8;
	} else if (spell.type === target.type) {
		damage *= 0.5;
	}
	return randomizeDamage(damage, spell.critical);
}

export function randomizeDamage(damage: number, criticalChance = 0.1): Hit {
	// damage has a range of 80% - 120%
	// a critical hit adds 30% of damage
	const critical = Math.random() < criticalChance;
	damage *= 0.8 + Math.random() * 0.4;
	damage *= critical ? 1.3 : 1;
	damage = Math.round(damage);
	return { damage, critical };
}
