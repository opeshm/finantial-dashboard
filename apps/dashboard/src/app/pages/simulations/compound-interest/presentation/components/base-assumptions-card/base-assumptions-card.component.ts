import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-base-assumptions-card',
  host: { class: 'block' },
  imports: [FormsModule, ComponentCardComponent],
  templateUrl: './base-assumptions-card.component.html',
})
export class BaseAssumptionsCardComponent {
  @Input({ required: true }) initialCapital!: number;
  @Input({ required: true }) annualGrowthRate!: number;
  @Input({ required: true }) simulationYears!: number;

  @Output() initialCapitalChange = new EventEmitter<number>();
  @Output() annualGrowthRateChange = new EventEmitter<number>();
  @Output() simulationYearsChange = new EventEmitter<number>();
}
