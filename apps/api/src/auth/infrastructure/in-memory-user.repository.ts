import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

/**
 * In-memory implementation of UserRepository.
 * Suitable for development. Replace with a persistent adapter (DB) when needed.
 * Users are stored by their Google sub (id) as the primary key.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users: Map<string, User> = new Map();

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user ?? null;
  }
}
