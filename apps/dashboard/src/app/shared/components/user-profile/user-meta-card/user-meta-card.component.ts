import { Component, computed, inject } from '@angular/core';
import { InputFieldComponent } from './../../form/input/input-field.component';
import { ModalService } from '../../../services/modal.service';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    ModalComponent,
    InputFieldComponent,
    ButtonComponent
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent {
  private readonly authService = inject(AuthService);
  public readonly modal = inject(ModalService);

  isOpen = false;
  isSaving = false;

  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  readonly user = computed(() => {
    const currentUser = this.authService.currentUser();
    const name = currentUser?.name || 'User';
    const nameParts = name.trim().split(' ');
    const firstName = currentUser?.firstName ?? nameParts[0] ?? 'User';
    const lastName = currentUser?.lastName ?? nameParts.slice(1).join(' ') ?? '';

    return {
      firstName,
      lastName,
      name,
      avatar: currentUser?.avatarUrl || '/images/user/owner.png',
      email: currentUser?.email || 'user@example.com',
      social: {
        facebook: currentUser?.socialLinks?.facebook || 'https://www.facebook.com',
        x: currentUser?.socialLinks?.x || 'https://x.com',
        linkedin: currentUser?.socialLinks?.linkedin || 'https://www.linkedin.com',
        instagram: currentUser?.socialLinks?.instagram || 'https://instagram.com',
      },
    };
  });

  async handleSave(
    firstName: string | number,
    lastName: string | number,
    facebook: string | number,
    x: string | number,
    linkedin: string | number,
    instagram: string | number,
  ): Promise<void> {
    this.isSaving = true;
    try {
      await this.authService.updateProfile({
        firstName: String(firstName ?? ''),
        lastName: String(lastName ?? ''),
        socialLinks: {
          facebook: String(facebook ?? ''),
          x: String(x ?? ''),
          linkedin: String(linkedin ?? ''),
          instagram: String(instagram ?? ''),
        },
      });
      this.closeModal();
    } catch (err) {
      console.error('Error updating user profile:', err);
    } finally {
      this.isSaving = false;
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      await this.authService.uploadAvatar(file);
    } catch (err) {
      console.error('Error uploading custom avatar:', err);
    }
  }
}
