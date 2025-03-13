import { useAuth } from '~/utils/auth';
import { z } from 'zod';

const userSettingsSchema = z.object({
  applicationTheme: z.string().nullable().optional(),
  applicationLanguage: z.string(),
  defaultSubtitleLanguage: z.string().nullable().optional(),
  proxyUrls: z.array(z.string()).nullable().optional(),
  traktKey: z.string().nullable().optional(),
  febboxKey: z.string().nullable().optional()
});

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id;
  
  const session = await useAuth().getCurrentSession();

  if (session.user !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Permission denied'
    });
  }

  if (event.method === 'GET') {
    const settings = await prisma.user_settings.findUnique({
      where: { id: userId }
    });

    return {
      id: userId,
      applicationTheme: settings?.application_theme || null,
      applicationLanguage: settings?.application_language || 'en',
      defaultSubtitleLanguage: settings?.default_subtitle_language || null,
      proxyUrls: settings?.proxy_urls || null,
      traktKey: settings?.trakt_key || null,
      febboxKey: settings?.febbox_key || null
    };
  }

  if (event.method === 'PUT') {
    try {
      const body = await readBody(event);
      const validatedBody = userSettingsSchema.parse(body);
      
      const data = {
        application_theme: validatedBody.applicationTheme,
        application_language: validatedBody.applicationLanguage,
        default_subtitle_language: validatedBody.defaultSubtitleLanguage ?? null,
        proxy_urls: validatedBody.proxyUrls ?? null,
        trakt_key: validatedBody.traktKey ?? null,
        febbox_key: validatedBody.febboxKey ?? null
      };

      const settings = await prisma.user_settings.upsert({
        where: { id: userId },
        update: data,
        create: {
          id: userId,
          ...data
        }
      });
      
      return {
        id: userId,
        applicationTheme: settings.application_theme,
        applicationLanguage: settings.application_language,
        defaultSubtitleLanguage: settings.default_subtitle_language,
        proxyUrls: settings.proxy_urls,
        traktKey: settings.trakt_key,
        febboxKey: settings.febbox_key
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          message: 'Invalid settings data',
          cause: error.errors
        });
      }
      
      throw createError({
        statusCode: 500,
        message: 'Failed to update settings'
      });
    }
  }
  
  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  });
});