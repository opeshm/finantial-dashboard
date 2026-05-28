import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { finalize } from 'rxjs';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DcaHistoricalApiService } from '../application/dca-historical-api.service';
import { AssetPreset, ContributionBlock, FREQUENCY_OPTIONS, Frequency, SimulationResult } from '../domain/dca-historical.models';

type MetricCard = {
  label: string;
  value: string;
  tone?: 'success' | 'error' | 'neutral';
};

@Component({
  selector: 'app-dca-historical',
  imports: [CommonModule, FormsModule, NgApexchartsModule, ComponentCardComponent, PageBreadcrumbComponent],
  templateUrl: './dca-historical.component.html',
})
export class DcaHistoricalComponent {
  assets: AssetPreset[] = [];
  symbol = 'IWDA.AS';
  startDate = '2014-01-01';
  endDate = new Date().toISOString().slice(0, 10);
  blocks: ContributionBlock[] = [this.createBlock(1)];
  result: SimulationResult | null = null;
  loading = false;
  error = '';

  readonly frequencyOptions = FREQUENCY_OPTIONS;

  portfolioSeries: ApexAxisChartSeries = [];
  portfolioChart: ApexChart = {
    type: 'area',
    height: 360,
    fontFamily: 'Outfit, sans-serif',
    toolbar: { show: false },
  };
  portfolioColors: string[] = ['#0F766E', '#71717A'];
  portfolioStroke: ApexStroke = { curve: 'smooth', width: [3, 2] };
  portfolioFill: ApexFill = {
    type: 'gradient',
    gradient: { opacityFrom: 0.35, opacityTo: 0.04 },
  };
  portfolioMarkers: ApexMarkers = { size: 0, hover: { size: 5 } };
  portfolioDataLabels: ApexDataLabels = { enabled: false };
  portfolioGrid: ApexGrid = { borderColor: '#E5E7EB', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } };
  portfolioXaxis: ApexXAxis = { categories: [], axisBorder: { show: false }, axisTicks: { show: false } };
  portfolioYaxis: ApexYAxis = { labels: { formatter: (value: number) => this.formatCompact(value), style: { colors: ['#6B7280'] } } };
  portfolioTooltip: ApexTooltip = { shared: true, intersect: false, y: { formatter: (value: number) => this.formatMoney(value) } };
  portfolioLegend: ApexLegend = { show: true, position: 'top', horizontalAlign: 'left' };

  priceSeries: ApexAxisChartSeries = [];
  priceChart: ApexChart = {
    type: 'line',
    height: 360,
    fontFamily: 'Outfit, sans-serif',
    toolbar: { show: false },
  };
  priceColors: string[] = ['#2563EB', '#F59E0B'];
  priceStroke: ApexStroke = { curve: 'smooth', width: [3, 3] };
  priceMarkers: ApexMarkers = { size: 0, hover: { size: 5 } };
  priceDataLabels: ApexDataLabels = { enabled: false };
  priceGrid: ApexGrid = { borderColor: '#E5E7EB', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } };
  priceXaxis: ApexXAxis = { categories: [], axisBorder: { show: false }, axisTicks: { show: false } };
  priceYaxis: ApexYAxis[] = [
    { labels: { formatter: (value: number) => this.formatMoney(value), style: { colors: ['#6B7280'] } } },
    { opposite: true, labels: { formatter: (value: number) => this.formatPercent(value / 100), style: { colors: ['#6B7280'] } } },
  ];
  priceTooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {
      formatter: (value: number, context?: { seriesIndex: number }) =>
        context?.seriesIndex === 1 ? this.formatPercent(value / 100) : this.formatMoney(value),
    },
  };
  priceLegend: ApexLegend = { show: true, position: 'top', horizontalAlign: 'left' };

  constructor(private readonly api: DcaHistoricalApiService) {
    this.loadAssets();
  }

  get selectedAsset(): AssetPreset | undefined {
    return this.assets.find((asset) => asset.symbol === this.symbol);
  }

  get metricCards(): MetricCard[] {
    if (!this.result) {
      return [];
    }

    const metrics = this.result.metrics;
    return [
      { label: 'Aportado', value: this.formatMoney(metrics.totalInvested) },
      { label: 'Valor final', value: this.formatMoney(metrics.finalValue) },
      { label: 'Beneficio', value: this.formatMoney(metrics.profit), tone: metrics.profit >= 0 ? 'success' : 'error' },
      { label: 'Rentabilidad', value: this.formatPercent(metrics.returnPct), tone: metrics.returnPct >= 0 ? 'success' : 'error' },
      { label: 'TIR anual aprox.', value: this.formatPercent(metrics.annualizedMoneyWeightedReturn) },
      { label: 'Max. drawdown', value: this.formatPercent(metrics.maxDrawdown), tone: 'error' },
      { label: 'Benchmark buy & hold', value: this.formatPercent(metrics.benchmarkReturnPct) },
      { label: 'Compras', value: String(metrics.purchases) },
    ];
  }

  runSimulation(): void {
    this.loading = true;
    this.error = '';

    this.api
      .runSimulation({
        symbol: this.symbol.trim().toUpperCase(),
        startDate: this.startDate,
        endDate: this.endDate,
        contributionBlocks: this.blocks.map((block) => ({ ...block, amount: Number(block.amount) })),
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => {
          this.result = result;
          this.buildCharts(result);
        },
        error: (error: Error) => {
          this.error = error.message;
        },
      });
  }

  addBlock(): void {
    this.blocks = [...this.blocks, this.createBlock(this.blocks.length + 1, this.startDate)];
  }

  removeBlock(id: string): void {
    if (this.blocks.length === 1) {
      return;
    }

    this.blocks = this.blocks.filter((block) => block.id !== id);
  }

  normalizeSymbol(): void {
    this.symbol = this.symbol.trim().toUpperCase();
  }

  trackBlock(_index: number, block: ContributionBlock): string {
    return block.id;
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: this.result?.currency ?? 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatUnits(value: number): string {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 4 }).format(value);
  }

  formatPercent(value: number | null): string {
    if (value === null || Number.isNaN(value)) {
      return 'N/D';
    }

    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }

  private loadAssets(): void {
    this.api.fetchAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
      },
      error: (error: Error) => {
        this.error = error.message;
      },
    });
  }

  private createBlock(index: number, startDate = this.startDate): ContributionBlock {
    return {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${index}`,
      label: `Bloque ${index}`,
      startDate,
      endDate: this.endDate,
      amount: 300,
      frequency: 'monthly',
    };
  }

  private buildCharts(result: SimulationResult): void {
    const chartData = this.reduceSeries(result.series);
    const categories = chartData.map((point) => point.date);

    this.portfolioXaxis = { ...this.portfolioXaxis, categories };
    this.portfolioSeries = [
      { name: 'Valor', data: chartData.map((point) => Number(point.value.toFixed(2))) },
      { name: 'Aportado', data: chartData.map((point) => Number(point.invested.toFixed(2))) },
    ];

    this.priceXaxis = { ...this.priceXaxis, categories };
    this.priceSeries = [
      { name: 'Precio ajustado', data: chartData.map((point) => Number(point.price.toFixed(2))) },
      { name: 'Rentabilidad', data: chartData.map((point) => Number((point.returnPct * 100).toFixed(2))) },
    ];
  }

  private reduceSeries(series: SimulationResult['series']): SimulationResult['series'] {
    const stride = Math.max(1, Math.floor(series.length / 750));
    return series.filter((_, index) => index % stride === 0 || index === series.length - 1);
  }

  private formatCompact(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
}
