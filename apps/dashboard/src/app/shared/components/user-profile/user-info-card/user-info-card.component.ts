import { Component, computed, inject } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-user-info-card',
  imports: [
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent {
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
      console.error('Error updating personal info:', err);
    } finally {
      this.isSaving = false;
    }
  }
}
