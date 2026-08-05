export interface User {
  id: string;              // Google sub (subject identifier)
  email: string;
  name: string;
  avatarUrl: string;       // Public CDN/API URL (e.g. http://localhost:4312/avatars/sub.jpg)
  googleAvatarUrl?: string; // Original Google avatar URL stored for change detection
}
