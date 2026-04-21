import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../../../shared/components/ui/modal/modal.component';
import { ExtraContribution } from '../../../domain/models/compound-interest.models';

@Component({
  selector: 'app-extra-contributions-modal',
  host: { class: 'block' },
  imports: [FormsModule, ModalComponent],
  templateUrl: './extra-contributions-modal.component.html',
})
export class ExtraContributionsModalComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) extraContributions!: ExtraContribution[];
  @Input({ required: true }) monthOptions!: string[];

  @Output() close = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();
  @Output() addContribution = new EventEmitter<void>();
  @Output() removeContribution = new EventEmitter<number>();
}
