import { version } from "./server/utils/config";
//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-03-05",
  runtimeConfig: {
    public: {
      meta: {
        name: process.env.META_NAME || 'empty',
        description: process.env.META_DESCRIPTION || 'empty',
        version: version || 'empty',
        captcha: process.env.CAPTCHA || false,
        captchaClientKey: process.env.CAPTCHA_CLIENT_KEY || ''
      }
    },
    cyrptoSecret: process.env.CRYPTO_SECRET,
    tmdbApiKey: process.env.TMDB_API_KEY,
  }
});