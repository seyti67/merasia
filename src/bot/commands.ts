import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const commands = [
	new SlashCommandBuilder()
		.setName('hunt')
		.setDescription('Use this command to fight a monster.')
		.addIntegerOption((option) =>
			option
				.setName('floor')
				.setDescription('The floor level to get monsters from.')
				.setRequired(false),
		),
	new SlashCommandBuilder()
		.setName('link')
		.setDescription('Use this command to access the web interface.'),
	new SlashCommandBuilder()
		.setName('help')
		.setDescription("You're lost with Merasia? This command is for you."),
	new SlashCommandBuilder()
		.setName('info')
		.setDescription('Use this command to get your personal stats.'),
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
			body: commands,
		});

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
