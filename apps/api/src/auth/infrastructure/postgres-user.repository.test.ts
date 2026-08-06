import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresUserRepository } from './postgres-user.repository.js';
import { User } from '../domain/user.entity.js';

class MockPgPool {
  public queries: Array<{ text: string; values?: any[] }> = [];
  public rows: any[] = [];
  public countRow = [{ count: '0' }];

  async query(text: string, values?: any[]): Promise<{ rows: any[] }> {
    this.queries.push({ text, values });

    if (text.includes('CREATE TABLE')) {
      return { rows: [] };
    }
    if (text.includes('SELECT COUNT(*)')) {
      return { rows: this.countRow };
    }
    if (text.includes('INSERT INTO users')) {
      const row = {
        id: values![0],
        email: values![1],
        name: values![2],
        first_name: values![3],
        last_name: values![4],
        avatar_url: values![5],
        google_avatar_url: values![6],
        social_links: values![7] ? JSON.parse(values![7]) : null,
      };
      this.rows.push(row);
      return { rows: [row] };
    }
    if (text.includes('SELECT * FROM users WHERE email')) {
      const match = this.rows.filter(r => r.email === values![0]);
      return { rows: match };
    }
    if (text.includes('SELECT * FROM users WHERE id')) {
      const match = this.rows.filter(r => r.id === values![0]);
      return { rows: match };
    }

    return { rows: [] };
  }
}

test('PostgresUserRepository maps entity to SQL queries correctly', async () => {
  const mockPool = new MockPgPool();
  const repo = new PostgresUserRepository(mockPool as any);

  const testUser: User = {
    id: 'user-db-1',
    email: 'db@example.com',
    name: 'DB User',
    firstName: 'DB',
    lastName: 'User',
    avatarUrl: 'http://localhost/avatar.png',
    googleAvatarUrl: 'http://google/avatar.png',
    socialLinks: { linkedin: 'https://linkedin.com/in/dbuser' },
  };

  const saved = await repo.save(testUser);
  assert.equal(saved.id, 'user-db-1');
  assert.equal(saved.email, 'db@example.com');
  assert.equal(saved.firstName, 'DB');
  assert.equal(saved.lastName, 'User');
  assert.equal(saved.socialLinks?.linkedin, 'https://linkedin.com/in/dbuser');

  const foundById = await repo.findById('user-db-1');
  assert.notEqual(foundById, null);
  assert.equal(foundById?.email, 'db@example.com');

  const foundByEmail = await repo.findByEmail('db@example.com');
  assert.notEqual(foundByEmail, null);
  assert.equal(foundByEmail?.id, 'user-db-1');
});
