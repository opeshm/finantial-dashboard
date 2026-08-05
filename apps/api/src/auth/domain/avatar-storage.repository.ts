export interface AvatarStorageRepository {
  /**
   * Downloads an avatar from origin URL (e.g. Google CDN) and stores it in local CDN.
   */
  mirrorAvatar(userId: string, originUrl: string): Promise<string>;

  /**
   * Saves a custom uploaded avatar file to the local CDN.
   */
  saveCustomAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string>;

  /**
   * Checks whether a local avatar file already exists for the given user ID.
   */
  avatarExists(userId: string): Promise<boolean>;
}
