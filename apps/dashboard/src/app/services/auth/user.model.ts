export interface UserSocialLinks {
  facebook?: string;
  x?: string;
  linkedin?: string;
  instagram?: string;
}

/**
 * Represents the authenticated user as returned by the backend API.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl: string;
  socialLinks?: UserSocialLinks;
}
