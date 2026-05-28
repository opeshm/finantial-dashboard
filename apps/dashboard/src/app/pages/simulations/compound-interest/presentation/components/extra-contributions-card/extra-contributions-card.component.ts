import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';
import { ExtraContribution } from '../../../domain/models/compound-interest.models';
import { formatCurrency } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-extra-contributions-card',
  host: { class: 'block' },
  imports: [ComponentCardComponent],
  templateUrl: './extra-contributions-card.component.html',
})
export class ExtraContributionsCardComponent {
  @Input({ required: true }) extraContributions!: ExtraContribution[];

  @Output() configure = new EventEmitter<void>();

  readonly formatCurrency = formatCurrency;

  get totalExtraContributions(): number {
    return this.extraContributions.reduce((total, item) => total + item.amount, 0);
  }

  get nextContribution(): ExtraContribution | undefined {
    return [...this.extraContributions].sort((left, right) => {
      if (left.year !== right.year) {
        return left.year - right.year;
      }

      return left.month - right.month;
    })[0];
  }
}
