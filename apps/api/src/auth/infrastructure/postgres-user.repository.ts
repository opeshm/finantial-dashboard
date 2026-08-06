import pg from 'pg';
import fs from 'node:fs/promises';
import { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

export class PostgresUserRepository implements UserRepository {
  private isInitialized = false;

  constructor(
    private readonly pool: pg.Pool,
    private readonly seedFilePath?: string,
  ) {}

  async initDb(): Promise<void> {
    if (this.isInitialized) return;

    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        avatar_url TEXT NOT NULL,
        google_avatar_url TEXT,
        social_links JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pool.query(query);

    // Seed from JSON file if table is empty and seed file exists
    if (this.seedFilePath) {
      try {
        const countRes = await this.pool.query('SELECT COUNT(*) FROM users');
        const count = parseInt(countRes.rows[0].count, 10);
        if (count === 0) {
          const raw = await fs.readFile(this.seedFilePath, 'utf-8');
          const seedUsers: User[] = JSON.parse(raw);
          for (const u of seedUsers) {
            await this.saveInternal(u);
          }
        }
      } catch {
        // Ignore seed errors if file doesn't exist or is invalid JSON
      }
    }

    this.isInitialized = true;
  }

  async save(user: User): Promise<User> {
    await this.initDb();
    return this.saveInternal(user);
  }

  private async saveInternal(user: User): Promise<User> {
    const query = `
      INSERT INTO users (
        id, email, name, first_name, last_name, avatar_url, google_avatar_url, social_links, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        google_avatar_url = EXCLUDED.google_avatar_url,
        social_links = EXCLUDED.social_links,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      user.id,
      user.email,
      user.name,
      user.firstName ?? null,
      user.lastName ?? null,
      user.avatarUrl,
      user.googleAvatarUrl ?? null,
      user.socialLinks ? JSON.stringify(user.socialLinks) : null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.initDb();

    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  async findById(id: string): Promise<User | null> {
    await this.initDb();

    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  private mapRowToUser(row: any): User {
    const socialLinks = typeof row.social_links === 'string'
      ? JSON.parse(row.social_links)
      : row.social_links;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      avatarUrl: row.avatar_url,
      googleAvatarUrl: row.google_avatar_url ?? undefined,
      socialLinks: socialLinks ?? undefined,
    };
  }
}
