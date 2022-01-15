import { Migration } from '@mikro-orm/migrations';

export class Migration20220115182139 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table "inventory";');
  }

}
