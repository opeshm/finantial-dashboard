import test from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from './user.service.js';
import { InMemoryUserRepository } from '../infrastructure/in-memory-user.repository.js';
import { AvatarStorageRepository } from '../domain/avatar-storage.repository.js';
import { User } from '../domain/user.entity.js';

class MockAvatarStorage implements AvatarStorageRepository {
  async mirrorAvatar(userId: string, _originUrl: string): Promise<string> {
    return `http://localhost:4312/avatars/${userId}.jpg`;
  }
  async saveCustomAvatar(userId: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    return `http://localhost:4312/avatars/custom_${userId}.png`;
  }
  async avatarExists(): Promise<boolean> {
    return true;
  }
}

test('UserService updates user profile names and social links', async () => {
  const repo = new InMemoryUserRepository();
  const avatarStorage = new MockAvatarStorage();
  const userService = new UserService(repo, avatarStorage);

  const initialUser: User = {
    id: 'user-1',
    email: 'alex@example.com',
    name: 'Alex Smith',
    avatarUrl: 'http://localhost:4312/avatars/user-1.jpg',
  };
  await repo.save(initialUser);

  const updated = await userService.updateProfile('user-1', {
    firstName: 'Alexander',
    lastName: 'Great',
    socialLinks: {
      facebook: 'https://facebook.com/alex',
      linkedin: 'https://linkedin.com/in/alex',
    },
  });

  assert.equal(updated.name, 'Alexander Great');
  assert.equal(updated.firstName, 'Alexander');
  assert.equal(updated.lastName, 'Great');
  assert.equal(updated.socialLinks?.linkedin, 'https://linkedin.com/in/alex');
});

test('UserService uploads custom avatar image to storage and updates avatarUrl', async () => {
  const repo = new InMemoryUserRepository();
  const avatarStorage = new MockAvatarStorage();
  const userService = new UserService(repo, avatarStorage);

  const initialUser: User = {
    id: 'user-2',
    email: 'maria@example.com',
    name: 'Maria Garcia',
    avatarUrl: 'http://localhost:4312/avatars/user-2.jpg',
  };
  await repo.save(initialUser);

  const fileBuffer = Buffer.from('dummy-image-binary');
  const updated = await userService.updateAvatar('user-2', fileBuffer, 'image/png');

  assert.equal(updated.avatarUrl, 'http://localhost:4312/avatars/custom_user-2.png');
});
