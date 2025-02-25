import { ArrayType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_settings' })
export class UserSettings {
  @PrimaryKey({ name: 'id', type: 'text' })
  id!: string;

  @Property({ name: 'application_theme', nullable: true })
  applicationTheme?: string | null;

  @Property({ name: 'application_language', nullable: true })
  applicationLanguage?: string | null;

  @Property({ name: 'default_subtitle_language', nullable: true })
  defaultSubtitleLanguage?: string | null;

  @Property({ name: 'proxy_urls', type: ArrayType, nullable: true })
  proxyUrls?: string[] | null;

  @Property({ name: 'trakt_key', nullable: true })
  traktKey?: string;

  @Property({ name: 'febbox_key', nullable: true })
  febboxKey?: string;
}

export interface UserSettingsDTO {
  id: string;
  applicationTheme?: string | null;
  applicationLanguage?: string | null;
  defaultSubtitleLanguage?: string | null;
  proxyUrls?: string[] | null;
}

export function formatUserSettings(
  userSettings: UserSettings,
): UserSettingsDTO {
  return {
    id: userSettings.id,
    applicationTheme: userSettings.applicationTheme,
    applicationLanguage: userSettings.applicationLanguage,
    defaultSubtitleLanguage: userSettings.defaultSubtitleLanguage,
    proxyUrls: userSettings.proxyUrls,
  };
}
