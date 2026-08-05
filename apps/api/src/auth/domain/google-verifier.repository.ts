import { User } from './user.entity.js';
import { GoogleIdToken } from './google-id-token.vo.js';

/**
 * Port (interface) for verifying Google ID tokens and extracting user profile.
 * The concrete implementation lives in the infrastructure layer.
 */
export interface GoogleVerifierRepository {
  verifyIdToken(token: GoogleIdToken): Promise<User>;
}
