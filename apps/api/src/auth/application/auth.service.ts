import { User } from '../domain/user.entity.js';
import { GoogleIdToken } from '../domain/google-id-token.vo.js';
import { GoogleVerifierRepository } from '../domain/google-verifier.repository.js';
import { UserRepository } from '../domain/user.repository.js';

/**
 * Application service: orchestrates the Google OAuth2 authentication flow.
 * 1. Verifies the Google ID token (via GoogleVerifierRepository).
 * 2. Upserts the user in the user store (via UserRepository).
 * 3. Returns the persisted user profile.
 */
export class AuthService {
  constructor(
    private readonly googleVerifier: GoogleVerifierRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async authenticateWithGoogle(idToken: GoogleIdToken): Promise<User> {
    // Verify token with Google and extract user profile
    const googleUser = await this.googleVerifier.verifyIdToken(idToken);

    // Upsert: if user already exists update their profile, otherwise create
    const existing = await this.userRepository.findByEmail(googleUser.email);
    if (existing) {
      const updated: User = { ...existing, name: googleUser.name, avatarUrl: googleUser.avatarUrl };
      return this.userRepository.save(updated);
    }

    return this.userRepository.save(googleUser);
  }
}
