import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';

import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const token = request.cookies.token;
		if (!token) {
			return false;
		}
		try {
			const decoded = verify(token, process.env.JWT_SECRET);
			const { id } = decoded;
			// if the token expires in the next 5 days, refresh it
			if (decoded.exp - Math.floor(Date.now() / 1000) < 60 * 60 * 24 * 5) {
				await this.userService.refreshToken(id);
				response.cookie(
					'token',
					sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
				);
			}
			request.user = id;
		} catch (e) {
			return false;
		}
		return true;
	}
}
