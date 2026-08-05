import fs from 'node:fs/promises';
import path from 'node:path';
import { AvatarStorageRepository } from '../domain/avatar-storage.repository.js';

export class LocalAvatarStorage implements AvatarStorageRepository {
  private readonly storageDir: string;
  private readonly baseUrl: string;

  constructor(storageDir: string, baseUrl: string) {
    this.storageDir = storageDir;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async avatarExists(userId: string): Promise<boolean> {
    const filePath = this.getFilePath(userId);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async mirrorAvatar(userId: string, originUrl: string): Promise<string> {
    await fs.mkdir(this.storageDir, { recursive: true });
    const filePath = this.getFilePath(userId);

    try {
      const response = await fetch(originUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to download avatar from ${originUrl}: status ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    } catch (err) {
      console.error(`[LocalAvatarStorage] Could not download avatar for ${userId}:`, err);
      const exists = await this.avatarExists(userId);
      if (!exists) {
        throw err;
      }
    }

    return `${this.baseUrl}/avatars/${this.getSanitizedId(userId)}.jpg`;
  }

  async saveCustomAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string> {
    await fs.mkdir(this.storageDir, { recursive: true });
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const filename = `custom_${this.getSanitizedId(userId)}.${ext}`;
    const filePath = path.join(this.storageDir, filename);

    await fs.writeFile(filePath, buffer);
    // Add cache buster query parameter to force browser refresh on new custom upload
    return `${this.baseUrl}/avatars/${filename}?v=${Date.now()}`;
  }

  private getSanitizedId(userId: string): string {
    return userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private getFilePath(userId: string): string {
    return path.join(this.storageDir, `${this.getSanitizedId(userId)}.jpg`);
  }
}
