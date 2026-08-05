import { OAuth2Client } from 'google-auth-library';
import { User } from '../domain/user.entity.js';
import { GoogleIdToken } from '../domain/google-id-token.vo.js';
import { GoogleVerifierRepository } from '../domain/google-verifier.repository.js';

/**
 * Infrastructure adapter: verifies Google ID tokens using the official
 * google-auth-library and extracts the user profile from the token payload.
 */
export class GoogleTokenVerifier implements GoogleVerifierRepository {
  private readonly client: OAuth2Client;
  private readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(token: GoogleIdToken): Promise<User> {
    const ticket = await this.client.verifyIdToken({
      idToken: token.value,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google ID token: empty payload');
    }

    const { sub, email, name, picture } = payload;

    if (!sub || !email) {
      throw new Error('Invalid Google ID token: missing required fields (sub, email)');
    }

    return {
      id: sub,
      email,
      name: name ?? email,
      avatarUrl: picture ?? '',
    };
  }
}
