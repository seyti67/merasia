import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get('login')
	async auth(
		@Query('code') code: string,
		@Query('state') state: string,
		@Req() req: any,
		@Res() res: any,
	) {
		const oauthState = Buffer.from(state, 'base64').toString('ascii');
		if (oauthState !== req.cookies.oauthState) {
			return;
		}
		const token = await this.authService.auth(code);
		if (!token) return 'unable to authenticate';

		res.cookie('token', token, { maxAge: 604800000 });
		res.cookie('oauthState', '', { maxAge: 0 });
		return res.redirect('/');
	}
}
