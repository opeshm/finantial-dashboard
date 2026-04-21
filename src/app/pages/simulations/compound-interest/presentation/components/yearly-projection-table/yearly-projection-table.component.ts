import { Component, Input } from '@angular/core';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';
import { YearlyProjection } from '../../../domain/models/compound-interest.models';
import { formatCurrency } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-yearly-projection-table',
  imports: [ComponentCardComponent],
  templateUrl: './yearly-projection-table.component.html',
})
export class YearlyProjectionTableComponent {
  @Input({ required: true }) yearlyProjection!: YearlyProjection[];

  readonly formatCurrency = formatCurrency;
}
