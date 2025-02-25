import { Migration } from '@mikro-orm/migrations';

export class Migration20250221223639 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_settings" add column "trakt_key" varchar(255) null, add column "febbox_key" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_settings" drop column "trakt_key";');
    this.addSql('alter table "user_settings" drop column "febbox_key";');
  }

}
