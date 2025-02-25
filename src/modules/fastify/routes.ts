import { indexRouter } from '@/routes';
import { loginAuthRouter } from '@/routes/auth/login';
import { manageAuthRouter } from '@/routes/auth/manage';
import { metaRouter } from '@/routes/meta';
import { metricsRouter } from '@/routes/metrics';
import { sessionsRouter } from '@/routes/sessions/sessions';
import { userBookmarkRouter } from '@/routes/users/bookmark';
import { userDeleteRouter } from '@/routes/users/delete';
import { userEditRouter } from '@/routes/users/edit';
import { userGetRouter } from '@/routes/users/get';
import { userProgressRouter } from '@/routes/users/progress';
import { userSessionsRouter } from '@/routes/users/sessions';
import { userSettingsRouter } from '@/routes/users/settings';
import { saveKeyRouter } from '@/routes/users/savekey';
import { FastifyInstance } from 'fastify';

export async function setupRoutes(app: FastifyInstance) {
  await app.register(manageAuthRouter.register);
  await app.register(loginAuthRouter.register);
  await app.register(userSessionsRouter.register);
  await app.register(sessionsRouter.register);
  await app.register(userEditRouter.register);
  await app.register(userDeleteRouter.register);
  await app.register(metaRouter.register);
  await app.register(userProgressRouter.register);
  await app.register(userBookmarkRouter.register);
  await app.register(userSettingsRouter.register);
  await app.register(userGetRouter.register);
  await app.register(metricsRouter.register);
  await app.register(indexRouter.register);
  await app.register(saveKeyRouter.register);
}
