import { Component, Input } from '@angular/core';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';
import { SimulationSummary } from '../../../domain/models/compound-interest.models';
import { formatCurrency, formatPercent } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-insights-card',
  host: { class: 'block' },
  imports: [ComponentCardComponent],
  templateUrl: './insights-card.component.html',
})
export class InsightsCardComponent {
  @Input({ required: true }) summary!: SimulationSummary;
  @Input({ required: true }) annualGrowthRate!: number;

  readonly formatCurrency = formatCurrency;
  readonly formatPercent = formatPercent;
}
