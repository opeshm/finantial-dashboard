import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';
import { ExtraContribution } from '../../../domain/models/compound-interest.models';

@Component({
  selector: 'app-extra-contributions-card',
  imports: [FormsModule, ComponentCardComponent],
  templateUrl: './extra-contributions-card.component.html',
})
export class ExtraContributionsCardComponent {
  @Input({ required: true }) extraContributions!: ExtraContribution[];
  @Input({ required: true }) monthOptions!: string[];

  @Output() changed = new EventEmitter<void>();
  @Output() addContribution = new EventEmitter<void>();
  @Output() removeContribution = new EventEmitter<number>();
}
