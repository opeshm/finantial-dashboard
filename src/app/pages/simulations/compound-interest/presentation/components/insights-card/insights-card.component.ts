import { Component, Input } from '@angular/core';
import { SimulationSummary } from '../../../domain/models/compound-interest.models';
import { formatCurrency, formatPercent } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-insights-card',
  host: { class: 'block' },
  imports: [],
  templateUrl: './insights-card.component.html',
})
export class InsightsCardComponent {
  @Input({ required: true }) summary!: SimulationSummary;
  @Input({ required: true }) annualGrowthRate!: number;

  readonly formatCurrency = formatCurrency;
  readonly formatPercent = formatPercent;
}
