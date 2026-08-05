import fs from 'node:fs/promises';
import path from 'node:path';
import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

export class FileUserRepository implements UserRepository {
  private readonly filePath: string;
  private memoryCache: Map<string, User> | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async save(user: User): Promise<User> {
    const usersMap = await this.getUsersMap();
    usersMap.set(user.id, user);
    await this.persist(usersMap);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const usersMap = await this.getUsersMap();
    for (const user of usersMap.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    const usersMap = await this.getUsersMap();
    return usersMap.get(id) ?? null;
  }

  private async getUsersMap(): Promise<Map<string, User>> {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data) as User[];
      this.memoryCache = new Map(parsed.map(u => [u.id, u]));
    } catch {
      this.memoryCache = new Map();
    }

    return this.memoryCache;
  }

  private async persist(usersMap: Map<string, User>): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    const array = Array.from(usersMap.values());
    await fs.writeFile(this.filePath, JSON.stringify(array, null, 2), 'utf-8');
  }
}
