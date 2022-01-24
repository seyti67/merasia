/* all the data about floors from 1 to 10 */
import { getMob, monsterName } from './monsters';
interface Floor {
	name: string;
	mobs: { [k in monsterName]: number };
}

export const floors: Floor[] = [
	{
		name: 'Friendly fields',
		mobs: {
			'grass spirit': 32,
			'water spirit': 30,
			'fire spirit': 27,
			'dark spirit': 6,
			'light spirit': 5,
		},
	},
];

// a function that returns a mob according to percentage of chance
const floorMobsTotals: number[] = [];
floors.forEach((floor: Floor) => {
	floorMobsTotals.push(Object.values(floor.mobs).reduce((a, b) => a + b, 0));
});

export function getMobAtFloor(floorNumber: number) {
	const floor = floors[floorNumber];
	let chance = Math.random() * floorMobsTotals[floorNumber];
	for (const mob in floor.mobs) {
		if (chance < floor.mobs[mob]) {
			return getMob(mob as monsterName);
		}
		chance -= floor.mobs[mob];
	}
}
