import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

type ContributionFrequency = 'monthly' | 'quarterly' | 'yearly';

type DcaRange = {
  id: number;
  label: string;
  startYear: number;
  endYear: number;
  amount: number;
  frequency: ContributionFrequency;
};

type ExtraContribution = {
  id: number;
  label: string;
  year: number;
  month: number;
  amount: number;
};

type YearlyProjection = {
  year: number;
  annualDca: number;
  annualExtra: number;
  annualContribution: number;
  annualInterest: number;
  endingBalance: number;
  cumulativeContributions: number;
  cumulativeInterest: number;
};

type SimulationSummary = {
  finalBalance: number;
  totalDca: number;
  totalExtra: number;
  totalContributions: number;
  totalInvested: number;
  totalInterest: number;
  roi: number;
  interestWeight: number;
  bestYearLabel: string;
  bestYearInterest: number;
};

type CompoundInterestConfigData = {
  initialCapital: number;
  annualGrowthRate: number;
  simulationYears: number;
  dcaRanges: DcaRange[];
  extraContributions: ExtraContribution[];
};

type StoredCompoundInterestConfig = {
  id: number;
  name: string;
  savedAt: string;
  data: CompoundInterestConfigData;
};

type CompoundInterestConfigExport = {
  version: 1;
  exportedAt: string;
  configs: StoredCompoundInterestConfig[];
};

@Component({
  selector: 'app-compound-interest',
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ModalComponent,
  ],
  templateUrl: './compound-interest.component.html',
})
export class CompoundInterestComponent {
  @ViewChild('configFileInput') configFileInput?: ElementRef<HTMLInputElement>;

  private readonly storageKey = 'compound-interest-configs';

  initialCapital = 20000;
  annualGrowthRate = 8;
  simulationYears = 25;
  isConfigModalOpen = false;
  configName = '';
  configSearch = '';
  configFeedback = '';
  configFeedbackType: 'success' | 'error' | 'info' = 'info';
  savedConfigs: StoredCompoundInterestConfig[] = [];

  readonly frequencyOptions: Array<{ value: ContributionFrequency; label: string }> = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ];

  readonly monthOptions = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  dcaRanges: DcaRange[] = [
    {
      id: 1,
      label: 'Base de acumulacion',
      startYear: 1,
      endYear: 10,
      amount: 400,
      frequency: 'monthly',
    },
    {
      id: 2,
      label: 'Refuerzo de largo plazo',
      startYear: 11,
      endYear: 25,
      amount: 650,
      frequency: 'monthly',
    },
  ];

  extraContributions: ExtraContribution[] = [
    { id: 1, label: 'Bonus anual', year: 3, month: 6, amount: 3000 },
    { id: 2, label: 'Herencia parcial', year: 12, month: 3, amount: 12000 },
  ];

  yearlyProjection: YearlyProjection[] = [];

  summary: SimulationSummary = {
    finalBalance: 0,
    totalDca: 0,
    totalExtra: 0,
    totalContributions: 0,
    totalInvested: 0,
    totalInterest: 0,
    roi: 0,
    interestWeight: 0,
    bestYearLabel: 'Año 1',
    bestYearInterest: 0,
  };

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
      formatter: (value: number) => this.formatCurrency(value),
    },
  };
  evolutionXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  evolutionYaxis: ApexYAxis = {
    labels: {
      formatter: (value: number) => this.formatCompact(value),
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
      formatter: (value: number) => this.formatCurrency(value),
    },
  };
  annualXaxis: ApexXAxis = {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };
  annualYaxis: ApexYAxis = {
    labels: {
      formatter: (value: number) => this.formatCompact(value),
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
      formatter: (value: number) => this.formatCurrency(value),
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

  constructor() {
    this.loadSavedConfigs();
    this.recalculate();
  }

  recalculate(): void {
    const years = this.normalizeInteger(this.simulationYears, 1, 50);
    const initialCapital = this.normalizeNumber(this.initialCapital, 0);
    const annualGrowthRate = this.normalizeNumber(this.annualGrowthRate, 0);
    const monthlyRate = Math.pow(1 + annualGrowthRate / 100, 1 / 12) - 1;

    const dcaRanges = this.dcaRanges
      .map((range) => ({
        ...range,
        startYear: this.normalizeInteger(range.startYear, 1, years),
        endYear: this.normalizeInteger(range.endYear, 1, years),
        amount: this.normalizeNumber(range.amount, 0),
      }))
      .filter((range) => range.amount > 0 && range.endYear >= range.startYear);

    const extraContributions = this.extraContributions
      .map((item) => ({
        ...item,
        year: this.normalizeInteger(item.year, 1, years),
        month: this.normalizeInteger(item.month, 1, 12),
        amount: this.normalizeNumber(item.amount, 0),
      }))
      .filter((item) => item.amount > 0);

    let balance = initialCapital;
    let cumulativeDca = 0;
    let cumulativeExtra = 0;
    let cumulativeInterest = 0;

    const yearlyProjection: YearlyProjection[] = [];

    for (let year = 1; year <= years; year += 1) {
      let annualDca = 0;
      let annualExtra = 0;
      let annualInterest = 0;

      for (let month = 1; month <= 12; month += 1) {
        const dcaAmount = dcaRanges.reduce((total, range) => {
          return total + (this.matchesContribution(range, year, month) ? range.amount : 0);
        }, 0);

        const extraAmount = extraContributions.reduce((total, item) => {
          return total + (item.year === year && item.month === month ? item.amount : 0);
        }, 0);

        const baseBeforeInterest = balance + dcaAmount + extraAmount;
        const interest = baseBeforeInterest * monthlyRate;

        balance = baseBeforeInterest + interest;
        annualDca += dcaAmount;
        annualExtra += extraAmount;
        annualInterest += interest;
      }

      cumulativeDca += annualDca;
      cumulativeExtra += annualExtra;
      cumulativeInterest += annualInterest;

      yearlyProjection.push({
        year,
        annualDca,
        annualExtra,
        annualContribution: annualDca + annualExtra,
        annualInterest,
        endingBalance: balance,
        cumulativeContributions: cumulativeDca + cumulativeExtra,
        cumulativeInterest,
      });
    }

    this.yearlyProjection = yearlyProjection;
    this.summary = this.buildSummary(initialCapital, cumulativeDca, cumulativeExtra, cumulativeInterest);
    this.buildEvolutionChart(initialCapital);
    this.buildAnnualChart();
    this.buildCompositionChart(initialCapital);
  }

  addDcaRange(): void {
    const nextId = this.getNextId(this.dcaRanges.map((item) => item.id));
    this.dcaRanges = [
      ...this.dcaRanges,
      {
        id: nextId,
        label: `Tramo ${nextId}`,
        startYear: 1,
        endYear: Math.max(1, this.normalizeInteger(this.simulationYears, 1, 50)),
        amount: 250,
        frequency: 'monthly',
      },
    ];
    this.recalculate();
  }

  removeDcaRange(id: number): void {
    this.dcaRanges = this.dcaRanges.filter((item) => item.id !== id);
    this.recalculate();
  }

  addExtraContribution(): void {
    const nextId = this.getNextId(this.extraContributions.map((item) => item.id));
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
    const trimmedName = this.configName.trim();

    if (!trimmedName) {
      this.setConfigFeedback('Introduce un nombre para guardar la configuracion.', 'error');
      return;
    }

    const configs = this.readStoredConfigs();
    const nextId = this.getNextId(configs.map((item) => item.id));
    const newConfig: StoredCompoundInterestConfig = {
      id: nextId,
      name: trimmedName,
      savedAt: new Date().toISOString(),
      data: this.getCurrentConfigData(),
    };

    configs.unshift(newConfig);
    this.writeStoredConfigs(configs);
    this.savedConfigs = configs;
    this.configName = '';
    this.setConfigFeedback(`Configuracion "${newConfig.name}" guardada en local.`, 'success');
  }

  loadConfiguration(config: StoredCompoundInterestConfig): void {
    this.applyConfigData(config.data);
    this.setConfigFeedback(`Configuracion "${config.name}" cargada correctamente.`, 'success');
    this.closeConfigModal();
  }

  deleteConfiguration(id: number): void {
    const config = this.savedConfigs.find((item) => item.id === id);
    const updatedConfigs = this.readStoredConfigs().filter((item) => item.id !== id);
    this.writeStoredConfigs(updatedConfigs);
    this.savedConfigs = updatedConfigs;
    this.setConfigFeedback(
      config ? `Configuracion "${config.name}" eliminada.` : 'Configuracion eliminada.',
      'success',
    );
  }

  exportCurrentConfiguration(): void {
    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs: [
        {
          id: 1,
          name: `Configuracion actual ${new Date().toLocaleDateString('es-ES')}`,
          savedAt: new Date().toISOString(),
          data: this.getCurrentConfigData(),
        },
      ],
    };

    this.downloadJson(payload, 'compound-interest-current.json');
    this.setConfigFeedback('Configuracion actual exportada en JSON.', 'success');
  }

  exportSavedConfiguration(config: StoredCompoundInterestConfig): void {
    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs: [config],
    };

    this.downloadJson(payload, `${this.slugify(config.name)}.json`);
    this.setConfigFeedback(`Configuracion "${config.name}" exportada en JSON.`, 'success');
  }

  exportAllSavedConfigurations(): void {
    if (!this.savedConfigs.length) {
      this.setConfigFeedback('No hay configuraciones guardadas para exportar.', 'error');
      return;
    }

    const payload: CompoundInterestConfigExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs: this.savedConfigs,
    };

    this.downloadJson(payload, 'compound-interest-configs.json');
    this.setConfigFeedback('Configuraciones guardadas exportadas en JSON.', 'success');
  }

  triggerImport(): void {
    this.configFileInput?.nativeElement.click();
  }

  async handleImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText) as Partial<CompoundInterestConfigExport> | Partial<StoredCompoundInterestConfig>;
      const importedConfigs = this.normalizeImportedConfigs(parsed);

      if (!importedConfigs.length) {
        this.setConfigFeedback('El archivo no contiene configuraciones validas.', 'error');
        return;
      }

      const existingConfigs = this.readStoredConfigs();
      let nextId = this.getNextId(existingConfigs.map((item) => item.id));
      const usedNames = new Set(existingConfigs.map((item) => item.name.toLowerCase()));

      const preparedImports = importedConfigs.map((config) => {
        const uniqueName = this.makeImportedName(config.name, usedNames);
        usedNames.add(uniqueName.toLowerCase());

        return {
          ...config,
          id: nextId++,
          name: uniqueName,
        };
      });

      const mergedConfigs = [...preparedImports, ...existingConfigs];

      this.writeStoredConfigs(mergedConfigs);
      this.savedConfigs = mergedConfigs;
      this.setConfigFeedback(`${importedConfigs.length} configuracion(es) importadas correctamente.`, 'success');
    } catch {
      this.setConfigFeedback('No se pudo importar el archivo JSON seleccionado.', 'error');
    } finally {
      input.value = '';
    }
  }

  get filteredSavedConfigs(): StoredCompoundInterestConfig[] {
    const term = this.configSearch.trim().toLowerCase();

    if (!term) {
      return this.savedConfigs;
    }

    return this.savedConfigs.filter((item) => item.name.toLowerCase().includes(term));
  }

  formatSavedDate(value: string): string {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatCompact(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private buildSummary(
    initialCapital: number,
    cumulativeDca: number,
    cumulativeExtra: number,
    cumulativeInterest: number,
  ): SimulationSummary {
    const totalContributions = cumulativeDca + cumulativeExtra;
    const totalInvested = initialCapital + totalContributions;
    const finalBalance = totalInvested + cumulativeInterest;
    const bestYear = this.yearlyProjection.reduce<YearlyProjection | null>((best, item) => {
      if (!best || item.annualInterest > best.annualInterest) {
        return item;
      }
      return best;
    }, null);

    return {
      finalBalance,
      totalDca: cumulativeDca,
      totalExtra: cumulativeExtra,
      totalContributions,
      totalInvested,
      totalInterest: cumulativeInterest,
      roi: totalInvested > 0 ? (cumulativeInterest / totalInvested) * 100 : 0,
      interestWeight: finalBalance > 0 ? (cumulativeInterest / finalBalance) * 100 : 0,
      bestYearLabel: bestYear ? `Año ${bestYear.year}` : 'Año 1',
      bestYearInterest: bestYear?.annualInterest ?? 0,
    };
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
          ...this.yearlyProjection.map((item) =>
            Number((initialCapital + item.cumulativeContributions).toFixed(2)),
          ),
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

  private matchesContribution(range: DcaRange, year: number, month: number): boolean {
    if (year < range.startYear || year > range.endYear) {
      return false;
    }

    if (range.frequency === 'monthly') {
      return true;
    }

    if (range.frequency === 'quarterly') {
      return month === 1 || month === 4 || month === 7 || month === 10;
    }

    return month === 1;
  }

  private normalizeNumber(value: number, minimum: number): number {
    if (!Number.isFinite(Number(value))) {
      return minimum;
    }

    return Math.max(minimum, Number(value));
  }

  private normalizeInteger(value: number, minimum: number, maximum: number): number {
    if (!Number.isFinite(Number(value))) {
      return minimum;
    }

    return Math.min(maximum, Math.max(minimum, Math.floor(Number(value))));
  }

  private getNextId(ids: number[]): number {
    return ids.length ? Math.max(...ids) + 1 : 1;
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

  private applyConfigData(data: CompoundInterestConfigData): void {
    this.initialCapital = this.normalizeNumber(data.initialCapital, 0);
    this.annualGrowthRate = this.normalizeNumber(data.annualGrowthRate, 0);
    this.simulationYears = this.normalizeInteger(data.simulationYears, 1, 50);
    this.dcaRanges = (data.dcaRanges ?? []).map((item, index) => ({
      id: index + 1,
      label: item.label || `Tramo ${index + 1}`,
      startYear: this.normalizeInteger(item.startYear, 1, this.simulationYears),
      endYear: this.normalizeInteger(item.endYear, 1, this.simulationYears),
      amount: this.normalizeNumber(item.amount, 0),
      frequency: item.frequency,
    }));
    this.extraContributions = (data.extraContributions ?? []).map((item, index) => ({
      id: index + 1,
      label: item.label || `Extra ${index + 1}`,
      year: this.normalizeInteger(item.year, 1, this.simulationYears),
      month: this.normalizeInteger(item.month, 1, 12),
      amount: this.normalizeNumber(item.amount, 0),
    }));
    this.recalculate();
  }

  private loadSavedConfigs(): void {
    this.savedConfigs = this.readStoredConfigs();
  }

  private readStoredConfigs(): StoredCompoundInterestConfig[] {
    try {
      const rawValue = globalThis.localStorage?.getItem(this.storageKey);

      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue) as StoredCompoundInterestConfig[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeStoredConfigs(configs: StoredCompoundInterestConfig[]): void {
    globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(configs));
  }

  private normalizeImportedConfigs(
    payload: Partial<CompoundInterestConfigExport> | Partial<StoredCompoundInterestConfig>,
  ): StoredCompoundInterestConfig[] {
    const configs = Array.isArray((payload as CompoundInterestConfigExport).configs)
      ? (payload as CompoundInterestConfigExport).configs
      : [payload as StoredCompoundInterestConfig];

    return configs
      .filter((item) => item && item.data)
      .map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.name?.trim() || `Configuracion importada ${index + 1}`,
        savedAt: item.savedAt || new Date().toISOString(),
        data: item.data as CompoundInterestConfigData,
      }));
  }

  private makeImportedName(name: string, existingNames: Set<string>): string {
    if (!existingNames.has(name.toLowerCase())) {
      return name;
    }

    let index = 2;
    let candidate = `${name} (${index})`;

    while (existingNames.has(candidate.toLowerCase())) {
      index += 1;
      candidate = `${name} (${index})`;
    }

    return candidate;
  }

  private downloadJson(payload: CompoundInterestConfigExport, fileName: string): void {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private setConfigFeedback(message: string, type: 'success' | 'error' | 'info'): void {
    this.configFeedback = message;
    this.configFeedbackType = type;
  }
}
