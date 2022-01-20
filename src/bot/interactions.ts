import {
	ButtonInteraction,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
} from 'discord.js';
import { getMobAtFloor } from 'src/game/floors';
import { FightService } from 'src/game/fight.service';
import { Injectable } from '@nestjs/common';
import { spells } from 'src/game/spells';

@Injectable()
export class Interactions {
	constructor(private fightService: FightService) {}

	async HandleCommand(interaction: CommandInteraction) {
		const { commandName } = interaction;
		switch (commandName) {
			case 'hunt':
				const row = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId('fight')
						.setLabel('Fight')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('flee')
						.setLabel('Flee')
						.setStyle('SECONDARY'),
				);
				const monster = getMobAtFloor(0);
				await interaction.reply({
					content: `A ${monster.name} lvl ${monster.level} just spawned!`,
					components: [row],
				});
				break;
			default:
				interaction.reply(`Unknown command: ${commandName}`);
				break;
		}
	}
	async HandleButton(interaction: ButtonInteraction) {
		const { customId } = interaction;
		const interactionId = BigInt(interaction.id) as unknown as number;
		if (customId === 'fight') {
			const { playerStats, monster } = await this.fightService.addFight(
				interactionId,
				getMobAtFloor(0),
				BigInt(interaction.user.id) as unknown as number,
			);

			const row = new MessageActionRow();
			let index = 0;
			for (const spell in playerStats.spells) {
				row.addComponents(
					new MessageButton()
						.setCustomId('spell-' + index)
						.setLabel(`${spells[spell].name} (${spells[spell].cost})`)
						.setStyle('PRIMARY'),
				);
				index++;
			}
			await interaction.update({
				embeds: [await this.fightService.displayFight(interactionId)],
				components: [row],
			});
			return;
		}
		if (customId === 'flee') {
			await interaction.update({ content: 'You coward', components: [] });
			return;
		}
		if (customId.startsWith('spell-')) {
			const spellIndex = Number(customId.split('-')[1]);
			this.fightService.castSpell(spellIndex, interactionId);
		}
		interaction.reply(`Unknown button: ${customId}`);
	}
}
