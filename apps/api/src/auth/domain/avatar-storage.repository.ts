export interface AvatarStorageRepository {
  /**
   * Downloads an avatar from the origin URL (e.g. Google CDN),
   * stores it in the local storage/CDN, and returns the served local URL.
   */
  mirrorAvatar(userId: string, originUrl: string): Promise<string>;

  /**
   * Checks whether a local avatar file already exists for the given user ID.
   */
  avatarExists(userId: string): Promise<boolean>;
}
