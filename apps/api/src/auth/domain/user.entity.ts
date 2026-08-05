export interface UserSocialLinks {
  facebook?: string;
  x?: string;
  linkedin?: string;
  instagram?: string;
}

export interface User {
  id: string;              // Google sub (subject identifier)
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl: string;       // Served by local API CDN (e.g. http://localhost:4312/avatars/sub.jpg)
  googleAvatarUrl?: string; // Original Google avatar URL
  socialLinks?: UserSocialLinks;
}
