import { FastifyInstance } from 'fastify';
import { AuthService } from '../application/auth.service.js';
import { GoogleTokenVerifier } from '../infrastructure/google-token-verifier.js';
import { InMemoryUserRepository } from '../infrastructure/in-memory-user.repository.js';

const clientId = process.env['GOOGLE_CLIENT_ID'];
if (!clientId) {
  throw new Error('Missing environment variable: GOOGLE_CLIENT_ID');
}

// Dependency injection at the composition root (presentation layer)
const googleVerifier = new GoogleTokenVerifier(clientId);
const userRepository = new InMemoryUserRepository();
const authService = new AuthService(googleVerifier, userRepository);

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /auth/google
   * Receives the Google ID token from the frontend (issued by GIS SDK),
   * verifies it and returns the authenticated user profile.
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
