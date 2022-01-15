import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import fetch from 'node-fetch';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	async auth(code: string): Promise<string> {
		const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
			method: 'post',
			body: new URLSearchParams({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: 'http://127.0.0.1/auth/login',
				scope: 'identify',
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = await oauthResult.json();

		const userResult = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `${data.token_type} ${data.access_token}`,
			},
		});
		const user = await userResult.json();
		this.userService.create(user.id, data.access_token, data.refresh_token);
		return sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
	}
}
