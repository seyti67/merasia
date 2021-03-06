import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { logger } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Client } from 'discord.js';
import { GameModule } from 'src/game/game.module';
import { Interactions } from './interactions';
// import './commands';

@Module({
	imports: [GameModule],
	providers: [Interactions],
})
export class BotModule {
	constructor(private interactions: Interactions) {
		const client = new Client({ intents: 0 });

		console.log('Starting bot...');
		client.once('ready', () => {
			logger.log('Bot is ready');
		});

		client.on('interactionCreate', (interaction) => {
			if (interaction.isCommand()) {
				interactions.HandleCommand(interaction);
			} else if (interaction.isButton()) {
				interactions.HandleButton(interaction);
			}
		});

		// Login to Discord with your client's token
		client.login(process.env.BOT_TOKEN);
	}
}
