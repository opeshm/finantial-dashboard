import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentCardComponent } from '../../../../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-dca-overview-card',
  imports: [ComponentCardComponent],
  templateUrl: './dca-overview-card.component.html',
})
export class DcaOverviewCardComponent {
  @Input({ required: true }) totalRanges!: number;
  @Output() configure = new EventEmitter<void>();
}
