import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from 'src/inventory/inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

@Controller('api/me')
@UseGuards(AuthGuard)
export class UserController {
	constructor(
		public userService: UserService,
		private inventoryService: InventoryService,
	) {}

	@Get()
	async personal(@Req() req: any) {
		return await this.userService.getUserData(req.user);
	}

	@Get('all')
	async all() {
		const users = await this.userService.getUsers();
		return users;
	}

	@Get('reset')
	async reset() {
		await this.userService.reset();
		await this.inventoryService.reset();
		return 'ok';
	}

	@Get('inventory')
	async getInventory(@Req() req: any) {
		return await this.inventoryService.getItems(req.user);
	}

	@Get('inventory/add/:item/:amount')
	async addItem(
		@Req() req: any,
		@Param('item') item: number,
		@Param('amount') amount: number,
	) {
		await this.inventoryService.addItem(req.user, Number(item), Number(amount));
		return await this.inventoryService.getItems(req.user);
	}

	@Get('inventory/remove/:item/:amount')
	async removeItem(
		@Req() req: any,
		@Param('item') item: number,
		@Param('amount') amount: number,
	) {
		return await this.inventoryService.removeItem(
			req.user,
			Number(item),
			Number(amount),
		);
	}
}
