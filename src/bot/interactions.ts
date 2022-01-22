import {
	ButtonInteraction,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
} from 'discord.js';
import { getMobAtFloor } from 'src/game/floors';
import { FightService } from 'src/game/fight.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Interactions {
	constructor(private fightService: FightService) {}

	async HandleCommand(interaction: CommandInteraction) {
		const { commandName } = interaction;
		if (commandName === 'hunt') {
			const playerId = BigInt(interaction.user.id) as unknown as number;

			if (this.fightService.exists(playerId)) {
				interaction.reply('You are already in a fight');
				return;
			}

			const monster = getMobAtFloor(0);
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
			await interaction.reply({
				content: `A ${monster.name} lvl ${monster.level} just spawned!`,
				components: [row],
			});

			await this.fightService.addFight(monster, playerId);
			return;
		} else {
			interaction.reply(`Unknown command: ${commandName}`);
			return;
		}
	}
	async HandleButton(interaction: ButtonInteraction) {
		const { customId } = interaction;
		const playerId = BigInt(interaction.user.id) as unknown as number;

		if (customId === 'fight') {
			this.fightService.start(playerId);
			const display = this.fightService.display(playerId);
			await interaction.update(display);
		} else if (customId === 'flee') {
			this.fightService.remove(playerId);
			await interaction.update({ content: 'You coward', components: [] });
		} else if (customId === 'skip') {
			this.fightService.skip(playerId);
			this.fightService.round(playerId);

			const display = this.fightService.display(playerId);
			await interaction.update(display);
		} else if (customId.startsWith('spell-')) {
			const spellIndex = Number(customId.split('-')[1]);
			this.fightService.castSpell(spellIndex, playerId);

			this.fightService.round(playerId);

			const display = this.fightService.display(playerId);
			await interaction.update(display);
		} else {
			interaction.reply(`Unknown button: ${customId}`);
		}
	}
}
//develop
