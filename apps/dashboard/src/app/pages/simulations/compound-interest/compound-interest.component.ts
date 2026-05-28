import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CompoundInterestConfigService } from './application/services/compound-interest-config.service';
import {
  CompoundInterestConfigData,
  ConfigFeedbackType,
  DcaRangeDraft,
  FREQUENCY_OPTIONS,
  MONTH_OPTIONS,
  StoredCompoundInterestConfig,
  SimulationSummary,
  YearlyProjection,
  createDefaultCompoundInterestConfigData,
  createEmptySummary,
} from './domain/models/compound-interest.models';
import { CompoundInterestConfigRepository } from './domain/repositories/compound-interest-config.repository';
import { CompoundInterestSimulationService } from './domain/services/compound-interest-simulation.service';
import { LocalStorageCompoundInterestConfigRepository } from './infrastructure/repositories/local-storage-compound-interest-config.repository';
import { BaseAssumptionsCardComponent } from './presentation/components/base-assumptions-card/base-assumptions-card.component';
import { ConfigurationsModalComponent } from './presentation/components/configurations-modal/configurations-modal.component';
import { DcaConfigModalComponent } from './presentation/components/dca-config-modal/dca-config-modal.component';
import { DcaOverviewCardComponent } from './presentation/components/dca-overview-card/dca-overview-card.component';
import { ExtraContributionsCardComponent } from './presentation/components/extra-contributions-card/extra-contributions-card.component';
import { ExtraContributionsModalComponent } from './presentation/components/extra-contributions-modal/extra-contributions-modal.component';
import { InsightsCardComponent } from './presentation/components/insights-card/insights-card.component';
import { SummaryMetricsComponent } from './presentation/components/summary-metrics/summary-metrics.component';
import { YearlyProjectionTableComponent } from './presentation/components/yearly-projection-table/yearly-projection-table.component';
import { formatCompact, formatCurrency, formatPercent } from './presentation/utils/compound-interest-formatters';

@Component({
  selector: 'app-compound-interest',
  imports: [
    CommonModule,
    NgApexchartsModule,
    ComponentCardComponent,
    PageBreadcrumbComponent,
    BaseAssumptionsCardComponent,
    DcaOverviewCardComponent,
    SummaryMetricsComponent,
    ExtraContributionsCardComponent,
    ExtraContributionsModalComponent,
    InsightsCardComponent,
    YearlyProjectionTableComponent,
    DcaConfigModalComponent,
    ConfigurationsModalComponent,
  ],
  providers: [
    CompoundInterestSimulationService,
    CompoundInterestConfigService,
    LocalStorageCompoundInterestConfigRepository,
    {
      provide: CompoundInterestConfigRepository,
      useExisting: LocalStorageCompoundInterestConfigRepository,
    },
  ],
  templateUrl: './compound-interest.component.html',
})
export class CompoundInterestComponent {
  initialCapital = 20000;
  annualGrowthRate = 8;
  simulationYears = 25;

  isConfigModalOpen = false;
  isDcaModalOpen = false;
  isExtraContributionsModalOpen = false;
  configName = '';
  configSearch = '';
  configFeedback = '';
  configFeedbackType: ConfigFeedbackType = 'info';
  savedConfigs: StoredCompoundInterestConfig[] = [];
  dcaDraft: DcaRangeDraft;

  readonly frequencyOptions = FREQUENCY_OPTIONS;
  readonly monthOptions = MONTH_OPTIONS;

  dcaRanges = createDefaultCompoundInterestConfigData().dcaRanges;
  extraContributions = createDefaultCompoundInterestConfigData().extraContributions;
  yearlyProjection: YearlyProjection[] = [];
  summary: SimulationSummary = createEmptySummary();

  evolutionSeries: ApexAxisChartSeries = [];
  evolutionChart: ApexChart = {
    type: 'area',
    height: 360,
    fontFamily: 'Outfit, sans-serif',
    toolbar: { show: false },
  };
  evolutionColors: string[] = ['#0F766E', '#2563EB', '#F59E0B'];
  evolutionStroke: ApexStroke = {
    curve: 'smooth',
    width: [3, 3, 3],
  };
  evolutionFill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.35,
      opacityTo: 0.02,
    },
  };
  evolutionMarkers: ApexMarkers = {
    size: 0,
    hover: { size: 5 },
  };
  evolutionGrid: ApexGrid = {
    borderColor: '#E5E7EB',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };
  evolutionDataLabels: ApexDataLabels = { enabled: false };
  evolutionTooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  };
  evolutionXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  evolutionYaxis: ApexYAxis = {
    labels: {
      formatter: (value: number) => formatCompact(value),
      style: { colors: ['#6B7280'] },
    },
  };
  evolutionLegend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
  };

  annualSeries: ApexAxisChartSeries = [];
  annualChart: ApexChart = {
    type: 'bar',
    height: 360,
    fontFamily: 'Outfit, sans-serif',
    toolbar: { show: false },
  };
  annualColors: string[] = ['#2563EB', '#14B8A6', '#F59E0B'];
  annualPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '46%',
      borderRadius: 6,
    },
  };
  annualDataLabels: ApexDataLabels = { enabled: false };
  annualStroke: ApexStroke = { show: false };
  annualGrid: ApexGrid = {
    borderColor: '#E5E7EB',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };
  annualTooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  };
  annualXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  annualYaxis: ApexYAxis = {
    labels: {
      formatter: (value: number) => formatCompact(value),
      style: { colors: ['#6B7280'] },
    },
  };
  annualLegend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
  };

  compositionSeries: ApexNonAxisChartSeries = [0, 0, 0];
  compositionChart: ApexChart = {
    type: 'donut',
    height: 320,
    fontFamily: 'Outfit, sans-serif',
  };
  compositionColors: string[] = ['#0F172A', '#2563EB', '#F59E0B'];
  compositionLabels: string[] = ['Capital inicial', 'Aportaciones', 'Intereses'];
  compositionLegend: ApexLegend = {
    show: false,
    position: 'bottom',
  };
  compositionPlotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '72%',
      },
    },
  };
  compositionDataLabels: ApexDataLabels = { enabled: false };
  compositionStroke: ApexStroke = {
    width: 0,
  };
  compositionTooltip: ApexTooltip = {
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  };
  compositionResponsive: ApexResponsive[] = [
    {
      breakpoint: 640,
      options: {
        chart: { height: 280 },
        legend: { position: 'bottom' },
      },
    },
  ];

  constructor(
    private readonly simulationService: CompoundInterestSimulationService,
    private readonly configService: CompoundInterestConfigService,
  ) {
    this.dcaDraft = this.simulationService.createDefaultDcaDraft(this.simulationYears);
    this.loadSavedConfigs();
    this.recalculate();
  }

  recalculate(): void {
    const normalizedData = this.simulationService.normalizeConfigData(this.getCurrentConfigData());

    this.initialCapital = normalizedData.initialCapital;
    this.annualGrowthRate = normalizedData.annualGrowthRate;
    this.simulationYears = normalizedData.simulationYears;
    this.dcaRanges = normalizedData.dcaRanges;
    this.extraContributions = normalizedData.extraContributions;

    const simulation = this.simulationService.simulate(normalizedData);
    this.yearlyProjection = simulation.yearlyProjection;
    this.summary = simulation.summary;
    this.buildEvolutionChart(normalizedData.initialCapital);
    this.buildAnnualChart();
    this.buildCompositionChart(normalizedData.initialCapital);
  }

  updateInitialCapital(value: number): void {
    this.initialCapital = value;
    this.recalculate();
  }

  updateAnnualGrowthRate(value: number): void {
    this.annualGrowthRate = value;
    this.recalculate();
  }

  updateSimulationYears(value: number): void {
    this.simulationYears = value;
    this.recalculate();
    this.dcaDraft = this.simulationService.createDefaultDcaDraft(this.simulationYears);
  }

  openDcaModal(): void {
    this.dcaDraft = this.simulationService.createDefaultDcaDraft(this.simulationYears);
    this.isDcaModalOpen = true;
  }

  closeDcaModal(): void {
    this.isDcaModalOpen = false;
  }

  saveDcaRange(): void {
    const nextId = this.simulationService.getNextId(this.dcaRanges.map((item) => item.id));
    this.dcaRanges = [
      ...this.dcaRanges,
      {
        id: nextId,
        label: this.dcaDraft.label.trim() || `Tramo ${nextId}`,
        startYear: this.simulationService.normalizeInteger(this.dcaDraft.startYear, 1, this.simulationYears),
        endYear: this.simulationService.normalizeInteger(this.dcaDraft.endYear, 1, this.simulationYears),
        amount: this.simulationService.normalizeNumber(this.dcaDraft.amount, 0),
        frequency: this.dcaDraft.frequency,
      },
    ];
    this.recalculate();
    this.dcaDraft = this.simulationService.createDefaultDcaDraft(this.simulationYears);
  }

  removeDcaRange(id: number): void {
    this.dcaRanges = this.dcaRanges.filter((item) => item.id !== id);
    this.recalculate();
  }

  addExtraContribution(): void {
    const nextId = this.simulationService.getNextId(this.extraContributions.map((item) => item.id));
    this.extraContributions = [
      ...this.extraContributions,
      {
        id: nextId,
        label: `Extra ${nextId}`,
        year: 1,
        month: 1,
        amount: 1000,
      },
    ];
    this.recalculate();
  }

  removeExtraContribution(id: number): void {
    this.extraContributions = this.extraContributions.filter((item) => item.id !== id);
    this.recalculate();
  }

  openExtraContributionsModal(): void {
    this.isExtraContributionsModalOpen = true;
  }

  closeExtraContributionsModal(): void {
    this.isExtraContributionsModalOpen = false;
  }

  openConfigModal(): void {
    this.loadSavedConfigs();
    this.configName = '';
    this.configSearch = '';
    this.setConfigFeedback('Gestiona tus escenarios guardados o comparte la configuracion actual en JSON.', 'info');
    this.isConfigModalOpen = true;
  }

  closeConfigModal(): void {
    this.isConfigModalOpen = false;
  }

  saveCurrentConfiguration(): void {
    const result = this.configService.saveConfiguration(this.configName, this.getCurrentConfigData());

    if (!result.ok) {
      this.setConfigFeedback(result.message, 'error');
      return;
    }

    this.savedConfigs = result.configs;
    this.configName = '';
    this.setConfigFeedback(`Configuracion "${result.config.name}" guardada en local.`, 'success');
  }

  loadConfiguration(config: StoredCompoundInterestConfig): void {
    const normalizedData = this.simulationService.normalizeConfigData(config.data);

    this.initialCapital = normalizedData.initialCapital;
    this.annualGrowthRate = normalizedData.annualGrowthRate;
    this.simulationYears = normalizedData.simulationYears;
    this.dcaRanges = normalizedData.dcaRanges;
    this.extraContributions = normalizedData.extraContributions;
    this.recalculate();
    this.setConfigFeedback(`Configuracion "${config.name}" cargada correctamente.`, 'success');
    this.closeConfigModal();
  }

  deleteConfiguration(id: number): void {
    const result = this.configService.deleteConfiguration(id);
    this.savedConfigs = result.configs;
    this.setConfigFeedback(
      result.deletedConfig ? `Configuracion "${result.deletedConfig.name}" eliminada.` : 'Configuracion eliminada.',
      'success',
    );
  }

  exportCurrentConfiguration(): void {
    this.configService.exportCurrentConfiguration(this.getCurrentConfigData());
    this.setConfigFeedback('Configuracion actual exportada en JSON.', 'success');
  }

  exportSavedConfiguration(config: StoredCompoundInterestConfig): void {
    this.configService.exportSavedConfiguration(config);
    this.setConfigFeedback(`Configuracion "${config.name}" exportada en JSON.`, 'success');
  }

  exportAllSavedConfigurations(): void {
    const exported = this.configService.exportAllSavedConfigurations(this.savedConfigs);

    if (!exported) {
      this.setConfigFeedback('No hay configuraciones guardadas para exportar.', 'error');
      return;
    }

    this.setConfigFeedback('Configuraciones guardadas exportadas en JSON.', 'success');
  }

  async handleImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const rawText = await file.text();
    const result = this.configService.importConfigurations(rawText);

    if (!result.ok) {
      this.setConfigFeedback(result.message, 'error');
      input.value = '';
      return;
    }

    this.savedConfigs = result.configs;
    this.setConfigFeedback(`${result.importedCount} configuracion(es) importadas correctamente.`, 'success');
    input.value = '';
  }

  get filteredSavedConfigs(): StoredCompoundInterestConfig[] {
    const term = this.configSearch.trim().toLowerCase();

    if (!term) {
      return this.savedConfigs;
    }

    return this.savedConfigs.filter((item) => item.name.toLowerCase().includes(term));
  }
  private buildEvolutionChart(initialCapital: number): void {
    this.evolutionXaxis = {
      ...this.evolutionXaxis,
      categories: ['Inicio', ...this.yearlyProjection.map((item) => `Año ${item.year}`)],
    };

    this.evolutionSeries = [
      {
        name: 'Capital total',
        data: [initialCapital, ...this.yearlyProjection.map((item) => Number(item.endingBalance.toFixed(2)))],
      },
      {
        name: 'Capital aportado',
        data: [
          initialCapital,
          ...this.yearlyProjection.map((item) => Number((initialCapital + item.cumulativeContributions).toFixed(2))),
        ],
      },
      {
        name: 'Intereses acumulados',
        data: [0, ...this.yearlyProjection.map((item) => Number(item.cumulativeInterest.toFixed(2)))],
      },
    ];
  }

  private buildAnnualChart(): void {
    this.annualXaxis = {
      ...this.annualXaxis,
      categories: this.yearlyProjection.map((item) => `Año ${item.year}`),
    };

    this.annualSeries = [
      {
        name: 'DCA',
        data: this.yearlyProjection.map((item) => Number(item.annualDca.toFixed(2))),
      },
      {
        name: 'Extraordinarias',
        data: this.yearlyProjection.map((item) => Number(item.annualExtra.toFixed(2))),
      },
      {
        name: 'Intereses del año',
        data: this.yearlyProjection.map((item) => Number(item.annualInterest.toFixed(2))),
      },
    ];
  }

  private buildCompositionChart(initialCapital: number): void {
    this.compositionSeries = [
      Number(initialCapital.toFixed(2)),
      Number(this.summary.totalContributions.toFixed(2)),
      Number(this.summary.totalInterest.toFixed(2)),
    ];
  }

  private getCurrentConfigData(): CompoundInterestConfigData {
    return {
      initialCapital: this.initialCapital,
      annualGrowthRate: this.annualGrowthRate,
      simulationYears: this.simulationYears,
      dcaRanges: this.dcaRanges.map((item) => ({ ...item })),
      extraContributions: this.extraContributions.map((item) => ({ ...item })),
    };
  }

  private loadSavedConfigs(): void {
    this.savedConfigs = this.configService.listSavedConfigurations();
  }

  private setConfigFeedback(message: string, type: ConfigFeedbackType): void {
    this.configFeedback = message;
    this.configFeedbackType = type;
  }
}
