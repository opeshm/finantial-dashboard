import { User } from '../domain/user.entity.js';
import { GoogleIdToken } from '../domain/google-id-token.vo.js';
import { GoogleVerifierRepository } from '../domain/google-verifier.repository.js';
import { UserRepository } from '../domain/user.repository.js';
import { AvatarStorageRepository } from '../domain/avatar-storage.repository.js';

/**
 * Application service: orchestrates the Google OAuth2 authentication flow.
 * 1. Verifies the Google ID token (via GoogleVerifierRepository).
 * 2. Checks if user exists and if avatar needs to be downloaded/mirrored to local CDN.
 * 3. Upserts the user in the persistent user store (via UserRepository).
 * 4. Returns the persisted user profile with CDN avatar URL.
 */
export class AuthService {
  constructor(
    private readonly googleVerifier: GoogleVerifierRepository,
    private readonly userRepository: UserRepository,
    private readonly avatarStorage?: AvatarStorageRepository,
  ) {}

  async authenticateWithGoogle(idToken: GoogleIdToken): Promise<User> {
    // Verify token with Google and extract user profile
    const googleUser = await this.googleVerifier.verifyIdToken(idToken);

    // Look up existing user by ID or Email
    let existing = await this.userRepository.findById(googleUser.id);
    if (!existing) {
      existing = await this.userRepository.findByEmail(googleUser.email);
    }

    let finalAvatarUrl = existing?.avatarUrl || googleUser.avatarUrl;

    // Check if avatar needs to be ingested into CDN storage
    if (this.avatarStorage && googleUser.avatarUrl) {
      const isNewUser = !existing;
      const googleAvatarChanged = existing?.googleAvatarUrl !== googleUser.avatarUrl;
      const fileMissing = !(await this.avatarStorage.avatarExists(googleUser.id));

      if (isNewUser || googleAvatarChanged || fileMissing) {
        try {
          finalAvatarUrl = await this.avatarStorage.mirrorAvatar(
            googleUser.id,
            googleUser.avatarUrl,
          );
        } catch (err) {
          console.error('[AuthService] Could not mirror Google avatar, falling back:', err);
          finalAvatarUrl = existing?.avatarUrl || googleUser.avatarUrl;
        }
      }
    }

    const userToSave: User = existing
      ? {
          ...existing,
          googleAvatarUrl: googleUser.avatarUrl,
          avatarUrl: finalAvatarUrl,
        }
      : {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: finalAvatarUrl,
          googleAvatarUrl: googleUser.avatarUrl,
        };

    return this.userRepository.save(userToSave);
  }
}
