import { Migration } from '@mikro-orm/migrations';

export class Migration20220115165001 extends Migration {
	async up(): Promise<void> {
		this.addSql('drop table "user"');
	}
}
