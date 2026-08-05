import { FastifyInstance } from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuthService } from '../application/auth.service.js';
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

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /auth/google
   * Receives the Google ID token from the frontend (issued by GIS SDK),
   * verifies it, downloads/mirrors the avatar to local CDN if needed,
   * persists the user record, and returns the authenticated user profile.
   *
   * Body: { idToken: string }
   * Response: { id, email, name, avatarUrl }
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
}
