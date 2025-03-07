import { useAuth } from '~/utils/auth';
import { z } from 'zod';

const bookmarkMetaSchema = z.object({
  title: z.string(),
  year: z.number().optional(),
  poster: z.string().optional(),
  type: z.enum(['movie', 'tv']),
});

const bookmarkDataSchema = z.object({
  tmdbId: z.string(),
  meta: bookmarkMetaSchema,
});

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.id;
  const method = event.method;
  
  const authHeader = getRequestHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  const auth = useAuth();
  
  const payload = auth.verifySessionToken(token);
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token'
    });
  }

  const session = await auth.getSessionAndBump(payload.sid);
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Session not found or expired'
    });
  }

  if (session.user !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Cannot access other user information'
    });
  }

  if (method === 'GET') {
    const bookmarks = await prisma.bookmarks.findMany({
      where: { user_id: userId }
    });

    return bookmarks.map(bookmark => ({
      tmdbId: bookmark.tmdb_id,
      userId: bookmark.user_id,
      meta: bookmark.meta,
      updatedAt: bookmark.updated_at
    }));
  }
  
  if (method === 'PUT') {
    const body = await readBody(event);
    const validatedBody = z.array(bookmarkDataSchema).parse(body);
    
    const now = new Date();
    const results = [];
    
    for (const item of validatedBody) {
      const bookmark = await prisma.bookmarks.upsert({
        where: {
          tmdb_id_user_id: {
            tmdb_id: item.tmdbId,
            user_id: userId
          }
        },
        update: {
          meta: item.meta,
          updated_at: now
        },
        create: {
          tmdb_id: item.tmdbId,
          user_id: userId,
          meta: item.meta,
          updated_at: now
        }
      });
      
      results.push({
        tmdbId: bookmark.tmdb_id,
        userId: bookmark.user_id,
        meta: bookmark.meta,
        updatedAt: bookmark.updated_at
      });
    }
    
    return results;
  }
  
  const segments = event.path.split('/');
  const tmdbId = segments[segments.length - 1];
  
  if (method === 'POST') {
    const body = await readBody(event);
    const validatedBody = bookmarkDataSchema.parse(body);
    
    const existing = await prisma.bookmarks.findUnique({
      where: {
        tmdb_id_user_id: {
          tmdb_id: tmdbId,
          user_id: userId
        }
      }
    });
    
    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'Already bookmarked'
      });
    }
    
    const bookmark = await prisma.bookmarks.create({
      data: {
        tmdb_id: tmdbId,
        user_id: userId,
        meta: validatedBody.meta,
        updated_at: new Date()
      }
    });
    
    return {
      tmdbId: bookmark.tmdb_id,
      userId: bookmark.user_id,
      meta: bookmark.meta,
      updatedAt: bookmark.updated_at
    };
  }
  
  if (method === 'DELETE') {
    try {
      await prisma.bookmarks.delete({
        where: {
          tmdb_id_user_id: {
            tmdb_id: tmdbId,
            user_id: userId
          }
        }
      });
    } catch (error) {
      
    }
    
    return { tmdbId };
  }
  
  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  });
});