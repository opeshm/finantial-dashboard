import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

export class GoogleAuthRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }
}
