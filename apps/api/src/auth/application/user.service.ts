import { User, UserSocialLinks } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { AvatarStorageRepository } from '../domain/avatar-storage.repository.js';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  socialLinks?: UserSocialLinks;
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly avatarStorage: AvatarStorageRepository,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const firstName = dto.firstName !== undefined ? dto.firstName : (user.firstName ?? user.name.split(' ')[0] ?? '');
    const lastName = dto.lastName !== undefined ? dto.lastName : (user.lastName ?? user.name.split(' ').slice(1).join(' ') ?? '');
    
    const name = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : user.name;

    const updatedUser: User = {
      ...user,
      name,
      firstName,
      lastName,
      socialLinks: {
        ...user.socialLinks,
        ...dto.socialLinks,
      },
    };

    return this.userRepository.save(updatedUser);
  }

  async updateAvatar(userId: string, fileBuffer: Buffer, mimeType: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const avatarUrl = await this.avatarStorage.saveCustomAvatar(userId, fileBuffer, mimeType);
    const updatedUser: User = {
      ...user,
      avatarUrl,
    };

    return this.userRepository.save(updatedUser);
  }
}
