export type ContributionFrequency = 'monthly' | 'quarterly' | 'yearly';

export type DcaRange = {
  id: number;
  label: string;
  startYear: number;
  endYear: number;
  amount: number;
  frequency: ContributionFrequency;
};

export type DcaRangeDraft = Omit<DcaRange, 'id'>;

export type ExtraContribution = {
  id: number;
  label: string;
  year: number;
  month: number;
  amount: number;
};

export type YearlyProjection = {
  year: number;
  annualDca: number;
  annualExtra: number;
  annualContribution: number;
  annualInterest: number;
  endingBalance: number;
  cumulativeContributions: number;
  cumulativeInterest: number;
};

export type SimulationSummary = {
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

export type CompoundInterestConfigData = {
  initialCapital: number;
  annualGrowthRate: number;
  simulationYears: number;
  dcaRanges: DcaRange[];
  extraContributions: ExtraContribution[];
};

export type StoredCompoundInterestConfig = {
  id: number;
  name: string;
  savedAt: string;
  data: CompoundInterestConfigData;
};

export type CompoundInterestConfigExport = {
  version: 1;
  exportedAt: string;
  configs: StoredCompoundInterestConfig[];
};

export type ConfigFeedbackType = 'success' | 'error' | 'info';

export type FrequencyOption = {
  value: ContributionFrequency;
  label: string;
};

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];

export const MONTH_OPTIONS = [
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

export function createDefaultDcaRanges(): DcaRange[] {
  return [
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
}

export function createDefaultExtraContributions(): ExtraContribution[] {
  return [
    { id: 1, label: 'Bonus anual', year: 3, month: 6, amount: 3000 },
    { id: 2, label: 'Herencia parcial', year: 12, month: 3, amount: 12000 },
  ];
}

export function createDefaultCompoundInterestConfigData(): CompoundInterestConfigData {
  return {
    initialCapital: 20000,
    annualGrowthRate: 8,
    simulationYears: 25,
    dcaRanges: createDefaultDcaRanges(),
    extraContributions: createDefaultExtraContributions(),
  };
}

export function createEmptySummary(): SimulationSummary {
  return {
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
}
