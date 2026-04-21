import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../../../shared/components/ui/modal/modal.component';
import { DcaRange, DcaRangeDraft, FrequencyOption } from '../../../domain/models/compound-interest.models';

@Component({
  selector: 'app-dca-config-modal',
  host: { class: 'block' },
  imports: [FormsModule, ModalComponent],
  templateUrl: './dca-config-modal.component.html',
})
export class DcaConfigModalComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) dcaDraft!: DcaRangeDraft;
  @Input({ required: true }) dcaRanges!: DcaRange[];
  @Input({ required: true }) frequencyOptions!: FrequencyOption[];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();
  @Output() removeRange = new EventEmitter<number>();
}
