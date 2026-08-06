import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from './auth.service.js';
import { InMemoryUserRepository } from '../infrastructure/in-memory-user.repository.js';
import { GoogleVerifierRepository } from '../domain/google-verifier.repository.js';
import { AvatarStorageRepository } from '../domain/avatar-storage.repository.js';
import { User } from '../domain/user.entity.js';

class MockGoogleVerifier implements GoogleVerifierRepository {
  public mockUser: User = {
    id: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://lh3.googleusercontent.com/avatar.jpg',
  };

  async verifyIdToken(): Promise<User> {
    return this.mockUser;
  }
}

class MockAvatarStorage implements AvatarStorageRepository {
  public mirroredCount = 0;

  async mirrorAvatar(userId: string, _originUrl: string): Promise<string> {
    this.mirroredCount++;
    return `http://localhost:4312/avatars/${userId}.jpg`;
  }

  async saveCustomAvatar(userId: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    return `http://localhost:4312/avatars/custom_${userId}.jpg`;
  }

  async avatarExists(): Promise<boolean> {
    return false;
  }
}

test('AuthService mirrors Google avatar to local CDN on first authentication', async () => {
  const verifier = new MockGoogleVerifier();
  const repo = new InMemoryUserRepository();
  const avatarStorage = new MockAvatarStorage();

  const authService = new AuthService(verifier, repo, avatarStorage);

  const user = await authService.authenticateWithGoogle({ value: 'valid-token' });

  assert.equal(user.id, 'google-123');
  assert.equal(user.avatarUrl, 'http://localhost:4312/avatars/google-123.jpg');
  assert.equal(user.googleAvatarUrl, 'https://lh3.googleusercontent.com/avatar.jpg');
  assert.equal(avatarStorage.mirroredCount, 1);
});

test('AuthService reuses CDN avatar if Google avatar URL has not changed', async () => {
  const verifier = new MockGoogleVerifier();
  const repo = new InMemoryUserRepository();
  const avatarStorage = new MockAvatarStorage();

  const authService = new AuthService(verifier, repo, avatarStorage);

  // First auth
  await authService.authenticateWithGoogle({ value: 'valid-token' });
  assert.equal(avatarStorage.mirroredCount, 1);

  // Mark avatar as existing in storage
  avatarStorage.avatarExists = async () => true;

  // Second auth with same token & same avatar URL
  const user2 = await authService.authenticateWithGoogle({ value: 'valid-token' });

  assert.equal(user2.avatarUrl, 'http://localhost:4312/avatars/google-123.jpg');
  assert.equal(avatarStorage.mirroredCount, 1); // Should not have re-downloaded
});

test('AuthService retains existing user DB data (name, firstName, lastName, email) when user exists', async () => {
  const verifier = new MockGoogleVerifier();
  const repo = new InMemoryUserRepository();
  const avatarStorage = new MockAvatarStorage();

  // Pre-seed an existing user with customized DB data
  await repo.save({
    id: 'google-123',
    email: 'custom@example.com',
    name: 'Custom Name',
    firstName: 'Custom',
    lastName: 'Name',
    avatarUrl: 'http://localhost:4312/avatars/custom_google-123.jpg',
  });

  const authService = new AuthService(verifier, repo, avatarStorage);
  const user = await authService.authenticateWithGoogle({ value: 'valid-token' });

  assert.equal(user.id, 'google-123');
  assert.equal(user.name, 'Custom Name');
  assert.equal(user.firstName, 'Custom');
  assert.equal(user.lastName, 'Name');
  assert.equal(user.email, 'custom@example.com');
});

