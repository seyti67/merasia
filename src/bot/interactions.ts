import {
	ButtonInteraction,
	CommandInteraction,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
} from 'discord.js';
import { getMobAtFloor } from 'src/game/data/floors';
import { FightService } from 'src/game/fights/fight.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Interactions {
	constructor(private fightService: FightService) {}

	async HandleCommand(interaction: CommandInteraction) {
		const { commandName, user } = interaction;
		const playerId = BigInt(user.id) as unknown as number;

		if (commandName === 'hunt') {
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
		} else if (commandName === 'info') {
			const player = await this.fightService.getPlayer(playerId);
			const embed = new MessageEmbed().setImage(
				process.env.BASE_URL + '/fight/' + player.id,
			);
			await interaction.reply({ embeds: [embed] });
		} else if (commandName === 'link') {
			await interaction.reply({
				content: 'Come here to manage your things!',
				components: [
					new MessageActionRow().addComponents(
						new MessageButton()
							.setLabel('Merasia')
							.setStyle('LINK')
							.setURL(process.env.BASE_URL),
					),
				],
			});
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
			await this.fightService.round(playerId);

			const display = this.fightService.display(playerId);
			await interaction.update(display);
		} else if (customId.startsWith('spell-')) {
			const spellIndex = Number(customId.split('-')[1]);
			this.fightService.castSpell(spellIndex, playerId);

			await this.fightService.round(playerId);

			const display = this.fightService.display(playerId);
			await interaction.update(display);
		} else {
			interaction.reply(`Unknown button: ${customId}`);
		}
	}
}
//develop
