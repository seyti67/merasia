export type Type = 'normal' | 'fire' | 'water' | 'grass' | 'dark' | 'light';

export type Effect = 'burn' | 'freeze' | 'poison';

export const weaknesses: { [key: string]: Type } = {
	grass: 'fire',
	water: 'grass',
	fire: 'water',
	light: 'dark',
	dark: 'light',
};
