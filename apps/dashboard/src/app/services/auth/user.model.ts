/**
 * Represents the authenticated user as returned by the backend API.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}
