import { Migration } from '@mikro-orm/migrations';

export class Migration20220115182239 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "inventory" ("id" bigserial primary key, "items" jsonb not null, "slots_nb" int4 not null);');
  }

}
