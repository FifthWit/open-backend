import { makeRouter } from '@/services/router';
import { handle } from '@/services/handler';
import { UserSettings } from '@/db/models/UserSettings';
import { z } from 'zod';
import crypto from 'crypto';

export const saveKeyRouter = makeRouter((app) => {
  app.post(
    '/key/febbox/set',
    {
      schema: {
        body: z.object({
          febboxKey: z.string(),
          encryptToken: z.string(),
        }),
      },
    },
    handle(async ({ auth, body, em }) => {
      await auth.assert();

      const { febboxKey, encryptToken } = body;

      const key = crypto.createHash('sha256').update(encryptToken).digest();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(febboxKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedFebboxKey = iv.toString('hex') + ':' + encrypted;
      await em.nativeUpdate(
        UserSettings,
        { id: auth.user.id },
        { febboxKey: encryptedFebboxKey },
      );

      return { message: 'Key saved successfully' };
    }),
  );
  app.post(
    '/key/febbox/get',
    {
      schema: {
        body: z.object({
          encryptToken: z.string(),
        }),
      },
    },
    handle(async ({ auth, body, em }) => {
      await auth.assert();

      const { encryptToken } = body;

      const userSettings = await em.findOne(UserSettings, {
        id: auth.user.id,
      });
      if (!userSettings || !userSettings.febboxKey) {
        return { message: 'No stored key found' };
      }
      const encryptedFebboxKey = userSettings.febboxKey;
      const parts = encryptedFebboxKey.split(':');
      if (parts.length !== 2) {
        return { message: 'Stored key format is invalid' };
      }
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const key = crypto.createHash('sha256').update(encryptToken).digest();
      let febboxKey: string;
      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        febboxKey = decipher.update(encrypted, 'hex', 'utf8');
        febboxKey += decipher.final('utf8');
      } catch (error) {
        return { message: 'Decryption failed. Invalid token.' };
      }

      return { febboxKey };
    }),
  );
});
