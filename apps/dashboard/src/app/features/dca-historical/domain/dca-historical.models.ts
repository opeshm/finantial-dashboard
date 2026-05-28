export type Frequency = 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type ContributionBlock = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  frequency: Frequency;
};

export type AssetPreset = {
  label: string;
  symbol: string;
  type: string;
  region: string;
};

export type SimulationResult = {
  symbol: string;
  currency: string;
  startDate: string;
  endDate: string;
  metrics: {
    totalInvested: number;
    finalValue: number;
    profit: number;
    returnPct: number;
    cagr: number | null;
    annualizedMoneyWeightedReturn: number | null;
    benchmarkReturnPct: number;
    maxDrawdown: number;
    units: number;
    purchases: number;
    firstPrice: number;
    lastPrice: number;
  };
  transactions: Array<{
    date: string;
    scheduledDate: string;
    blockId: string;
    label: string;
    amount: number;
    price: number;
    units: number;
  }>;
  series: Array<{
    date: string;
    price: number;
    units: number;
    invested: number;
    value: number;
    profit: number;
    returnPct: number;
  }>;
};

export type FrequencyOption = {
  value: Frequency;
  label: string;
};

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { value: 'once', label: 'Una vez' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];
