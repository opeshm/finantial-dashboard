import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../../../shared/components/ui/modal/modal.component';
import { ConfigFeedbackType, StoredCompoundInterestConfig } from '../../../domain/models/compound-interest.models';
import { formatSavedDate } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-configurations-modal',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './configurations-modal.component.html',
})
export class ConfigurationsModalComponent {
  @ViewChild('configFileInput') configFileInput?: ElementRef<HTMLInputElement>;

  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) configName!: string;
  @Input({ required: true }) configSearch!: string;
  @Input({ required: true }) configFeedback!: string;
  @Input({ required: true }) configFeedbackType!: ConfigFeedbackType;
  @Input({ required: true }) filteredSavedConfigs!: StoredCompoundInterestConfig[];

  @Output() close = new EventEmitter<void>();
  @Output() configNameChange = new EventEmitter<string>();
  @Output() configSearchChange = new EventEmitter<string>();
  @Output() saveCurrent = new EventEmitter<void>();
  @Output() exportCurrent = new EventEmitter<void>();
  @Output() exportAll = new EventEmitter<void>();
  @Output() importFile = new EventEmitter<Event>();
  @Output() loadConfiguration = new EventEmitter<StoredCompoundInterestConfig>();
  @Output() exportConfiguration = new EventEmitter<StoredCompoundInterestConfig>();
  @Output() deleteConfiguration = new EventEmitter<number>();

  readonly formatSavedDate = formatSavedDate;

  triggerImport(): void {
    this.configFileInput?.nativeElement.click();
  }
}
