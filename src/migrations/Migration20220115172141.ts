import { Migration } from '@mikro-orm/migrations';

export class Migration20220115172141 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "inventory" add column "slots_nb" int4 not null;');
  }

}
