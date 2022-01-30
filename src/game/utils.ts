export function xpUntilNext(level: number): number {
	// the amount of xp needed is multiplied by two each ten levels
	return Math.floor(Math.pow(2, level / 10) * 500);
}
