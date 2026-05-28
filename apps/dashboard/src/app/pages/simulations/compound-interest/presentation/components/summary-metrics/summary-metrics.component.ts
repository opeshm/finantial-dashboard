import { Component, Input } from '@angular/core';
import { SimulationSummary } from '../../../domain/models/compound-interest.models';
import { formatCurrency, formatPercent } from '../../utils/compound-interest-formatters';

@Component({
  selector: 'app-summary-metrics',
  host: { class: 'block' },
  imports: [],
  templateUrl: './summary-metrics.component.html',
})
export class SummaryMetricsComponent {
  @Input({ required: true }) summary!: SimulationSummary;
  @Input({ required: true }) simulationYears!: number;

  readonly formatCurrency = formatCurrency;
  readonly formatPercent = formatPercent;
}
