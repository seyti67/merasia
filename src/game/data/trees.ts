const trees = [
	{
		name: 'Populus',
		description:
			'This tree can grow pretty high but it is not very strong and quite thin.',
		logId: 31,
	},
	{
		name: 'Oak',
		description:
			"This is a very strong tree but it's not rare and the mana flux is low.",
		logId: 32,
	},
	{
		name: 'Bloody dogwood',
		description: 'This tree has fruits full of mana and it is quite rare.',
		logId: 33,
	},
	{
		name: 'Brazil wood',
		description:
			'Red as ember, this tree burns with power. It is very rare and powerful.',
		logId: 34,
	},
	{
		name: 'Snakewood',
		description:
			'This tree is the rarest you can find. It is very strong and has a high mana flux.',
		logId: 35,
	},
];

const treePercentages: number[][] = [];
function getTreePercentages(level: number) {
	// maximum of level 20
	// chances of each tree tier depending on the farm level
	const exp = Math.exp;
	// weird formula, log15 cubic to make the progression more pleasant
	const log = (x: number) => Math.pow(Math.log10(x) / Math.log10(15), 3);

	level++; // avoid 0 division
	const treesPerLevel = [
		exp(5 / log(level)),
		exp(4.5 / log(level)),
		exp(4 / log(level)),
		exp(3 / log(level)),
		exp(1 / log(level)),
	];
	const total = treesPerLevel.reduce((a, b) => a + b);
	return treesPerLevel.map((e) => e / total);
}
for (let i = 0; i < 20; i++) {
	treePercentages[i] = getTreePercentages(i);
}

export function getTree(farmLevel: number) {
	const rand = Math.random();
	let sum = 0;
	for (let i = 0; i < treePercentages[farmLevel].length; i++) {
		sum += treePercentages[farmLevel][i];
		if (rand < sum) {
			return trees[i];
		}
	}
	return trees[0];
}
