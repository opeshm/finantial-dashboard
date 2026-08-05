import { FastifyInstance } from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuthService } from '../application/auth.service.js';
import { UserService, UpdateProfileDto } from '../application/user.service.js';
import { GoogleTokenVerifier } from '../infrastructure/google-token-verifier.js';
import { FileUserRepository } from '../infrastructure/file-user.repository.js';
import { LocalAvatarStorage } from '../infrastructure/local-avatar-storage.js';

const clientId = process.env['GOOGLE_CLIENT_ID'];
if (!clientId) {
  throw new Error('Missing environment variable: GOOGLE_CLIENT_ID');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDbPath = path.resolve(__dirname, '../../../data/users.json');
const avatarsStorageDir = path.resolve(__dirname, '../../../public/avatars');
const apiBaseUrl = process.env['API_BASE_URL'] ?? 'http://localhost:4312';

// Dependency injection at composition root
const googleVerifier = new GoogleTokenVerifier(clientId);
const userRepository = new FileUserRepository(dataDbPath);
const avatarStorage = new LocalAvatarStorage(avatarsStorageDir, apiBaseUrl);
const authService = new AuthService(googleVerifier, userRepository, avatarStorage);
const userService = new UserService(userRepository, avatarStorage);

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /auth/google
   * Authenticates user via Google ID Token
   */
  app.post('/auth/google', async (request, reply) => {
    const { idToken } = request.body as { idToken?: string };

    if (!idToken || typeof idToken !== 'string') {
      return reply.code(400).send({ error: 'Missing or invalid idToken in request body' });
    }

    try {
      const user = await authService.authenticateWithGoogle({ value: idToken });
      return reply.code(200).send(user);
    } catch (err) {
      app.log.error(err);
      return reply.code(401).send({ error: 'Authentication failed: invalid Google ID token' });
    }
  });

  /**
   * PATCH /users/:id/profile
   * Updates user profile fields (firstName, lastName, socialLinks)
   */
  app.patch('/users/:id/profile', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as UpdateProfileDto;

    try {
      const updatedUser = await userService.updateProfile(id, body);
      return reply.code(200).send(updatedUser);
    } catch (err) {
      app.log.error(err);
      return reply.code(400).send({ error: (err as Error).message });
    }
  });

  /**
   * POST /users/:id/avatar
   * Uploads custom avatar file for user and stores in local CDN
   */
  app.post('/users/:id/avatar', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ error: 'No avatar image file provided' });
    }

    try {
      const buffer = await data.toBuffer();
      const updatedUser = await userService.updateAvatar(id, buffer, data.mimetype);
      return reply.code(200).send(updatedUser);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: (err as Error).message });
    }
  });
}
