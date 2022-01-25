import { xpUntilNext } from 'src/game/utils';
import { Player } from 'src/user/user.service';

export const info = (player: Player) => {
	const percentHealth = (600 * player.health) / player.maxHealth;
	const percentMana = (600 * player.mana) / player.maxMana;
	const nextLevel = xpUntilNext(player.level);
	const percentXp = (600 * player.xp) / nextLevel;
	return `
	<svg width="700" height="267" viewBox="0 0 700 267" fill="none" xmlns="http://www.w3.org/2000/svg">

	<style>
	text {
		font-family: "Arial";
		font-size: 22px;
		fill: #ffffff;
		text-anchor: middle;
		text-shadow: 0px 0px 3px #000000;
	}
	text.big {
		font-size: 30px;
	}
	</style>
	
	<rect width="700" height="250" fill="#222C53"/>
	
	<rect x="50" y="80" width="600" height="30" rx="17" fill="#7A414C"/>
	<rect x="50" y="80" width="${percentHealth}" height="30" rx="17" fill="#C92845"/>
	<text x="50%" y="102">${
		player.health === player.maxHealth
			? player.health
			: `${player.health}/${player.maxHealth}`
	} pv</text>
	<rect x="50" y="130" width="600" height="30" rx="17" fill="#4D4E8E"/>
	<rect x="50" y="130" width="${percentMana}" height="30" rx="17" fill="#2224AA"/>
	<text x="50%" y="152">${
		player.mana === player.maxMana
			? player.mana
			: `${player.mana}/${player.maxMana}`
	} mp</text>
	<rect x="50" y="180" width="600" height="30" rx="17" fill="#998D5B"/>
	<rect x="50" y="180" width="${percentXp}" height="30" rx="17" fill="#EAC629"/>
	<text x="50%" y="202">${
		player.xp === nextLevel ? player.xp : `${player.xp}/${nextLevel}`
	} xp</text>
	
	<text x="50%" y="50" class="big">level ${player.level}</text>
	</svg>
	`;
};
