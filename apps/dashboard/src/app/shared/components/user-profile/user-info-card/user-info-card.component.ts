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
  openModal() { this.isOpen = true; }
  closeModal() { this.isOpen = false; }

  readonly user = computed(() => {
    const currentUser = this.authService.currentUser();
    const name = currentUser?.name || 'User';
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      email: currentUser?.email || 'user@example.com',
      phone: '+09 363 398 46',
      bio: 'Financial Dashboard User',
      social: {
        facebook: 'https://www.facebook.com',
        x: 'https://x.com',
        linkedin: 'https://www.linkedin.com',
        instagram: 'https://instagram.com',
      },
    };
  });

  handleSave() {
    console.log('Saving changes...');
    this.closeModal();
  }
}

