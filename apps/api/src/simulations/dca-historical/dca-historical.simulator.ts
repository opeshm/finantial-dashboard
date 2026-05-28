import type { ContributionBlock, Frequency, SimulationRequest } from './dca-historical.schema.js';

export type PricePoint = {
  date: string;
  close: number;
};

export type Transaction = {
  date: string;
  scheduledDate: string;
  blockId: string;
  label: string;
  amount: number;
  price: number;
  units: number;
};

export type SimulationPoint = {
  date: string;
  price: number;
  units: number;
  invested: number;
  value: number;
  profit: number;
  returnPct: number;
};

export type SimulationResult = {
  symbol: string;
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
  transactions: Transaction[];
  series: SimulationPoint[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addFrequency(date: Date, frequency: Frequency): Date {
  const next = new Date(date);
  if (frequency === 'weekly') next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === 'monthly') next.setUTCMonth(next.getUTCMonth() + 1);
  if (frequency === 'quarterly') next.setUTCMonth(next.getUTCMonth() + 3);
  if (frequency === 'yearly') next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

function scheduledContributions(blocks: ContributionBlock[]): Array<{ scheduledDate: string; block: ContributionBlock }> {
  return blocks
    .flatMap((block) => {
      const dates: Array<{ scheduledDate: string; block: ContributionBlock }> = [];
      let cursor = parseDate(block.startDate);
      const end = parseDate(block.endDate);

      while (cursor <= end) {
        dates.push({ scheduledDate: formatDate(cursor), block });
        if (block.frequency === 'once') break;
        cursor = addFrequency(cursor, block.frequency);
      }

      return dates;
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
}

function firstTradingDayOnOrAfter(prices: PricePoint[], date: string): PricePoint | undefined {
  return prices.find((point) => point.date >= date);
}

function yearsBetween(startDate: string, endDate: string): number {
  return Math.max((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / (365.25 * MS_PER_DAY), 1 / 365.25);
}

function maxDrawdown(series: Array<{ value: number }>): number {
  let peak = 0;
  let worst = 0;

  for (const point of series) {
    peak = Math.max(peak, point.value);
    if (peak > 0) {
      worst = Math.min(worst, (point.value - peak) / peak);
    }
  }

  return worst;
}

function xirr(cashFlows: Array<{ date: string; amount: number }>): number | null {
  if (!cashFlows.some((flow) => flow.amount < 0) || !cashFlows.some((flow) => flow.amount > 0)) {
    return null;
  }

  const start = parseDate(cashFlows[0].date).getTime();
  let rate = 0.08;

  for (let i = 0; i < 80; i += 1) {
    let value = 0;
    let derivative = 0;

    for (const flow of cashFlows) {
      const years = (parseDate(flow.date).getTime() - start) / (365.25 * MS_PER_DAY);
      const denominator = Math.pow(1 + rate, years);
      value += flow.amount / denominator;
      derivative += (-years * flow.amount) / Math.pow(1 + rate, years + 1);
    }

    if (Math.abs(value) < 0.0001) return rate;
    if (Math.abs(derivative) < 1e-10) break;

    const next = rate - value / derivative;
    if (!Number.isFinite(next) || next <= -0.9999) break;
    rate = next;
  }

  return null;
}

export function runDcaHistoricalSimulation(request: SimulationRequest, prices: PricePoint[]): SimulationResult {
  const rangedPrices = prices.filter((point) => point.date >= request.startDate && point.date <= request.endDate);
  if (rangedPrices.length === 0) {
    throw new Error('No hay precios disponibles para el rango seleccionado.');
  }

  const transactions: Transaction[] = [];

  for (const contribution of scheduledContributions(request.contributionBlocks)) {
    if (contribution.scheduledDate < request.startDate || contribution.scheduledDate > request.endDate) continue;

    const pricePoint = firstTradingDayOnOrAfter(rangedPrices, contribution.scheduledDate);
    if (!pricePoint || pricePoint.date > request.endDate) continue;

    transactions.push({
      date: pricePoint.date,
      scheduledDate: contribution.scheduledDate,
      blockId: contribution.block.id,
      label: contribution.block.label,
      amount: contribution.block.amount,
      price: pricePoint.close,
      units: contribution.block.amount / pricePoint.close,
    });
  }

  let units = 0;
  let invested = 0;
  let transactionIndex = 0;
  const sortedTransactions = transactions.sort((a, b) => a.date.localeCompare(b.date));
  const series = rangedPrices.map((price) => {
    while (transactionIndex < sortedTransactions.length && sortedTransactions[transactionIndex].date <= price.date) {
      units += sortedTransactions[transactionIndex].units;
      invested += sortedTransactions[transactionIndex].amount;
      transactionIndex += 1;
    }

    const value = units * price.close;
    return {
      date: price.date,
      price: price.close,
      units,
      invested,
      value,
      profit: value - invested,
      returnPct: invested > 0 ? (value - invested) / invested : 0,
    };
  });

  const last = series[series.length - 1];
  const firstPrice = rangedPrices[0].close;
  const lastPrice = rangedPrices[rangedPrices.length - 1].close;
  const totalInvested = sortedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const finalValue = last.value;
  const profit = finalValue - totalInvested;
  const years = yearsBetween(request.startDate, request.endDate);
  const benchmarkReturnPct = (lastPrice - firstPrice) / firstPrice;
  const cagr = totalInvested > 0 && finalValue > 0 ? Math.pow(finalValue / totalInvested, 1 / years) - 1 : null;
  const annualizedMoneyWeightedReturn = xirr([
    ...sortedTransactions.map((transaction) => ({ date: transaction.date, amount: -transaction.amount })),
    { date: rangedPrices[rangedPrices.length - 1].date, amount: finalValue },
  ]);

  return {
    symbol: request.symbol.toUpperCase(),
    startDate: rangedPrices[0].date,
    endDate: rangedPrices[rangedPrices.length - 1].date,
    metrics: {
      totalInvested,
      finalValue,
      profit,
      returnPct: totalInvested > 0 ? profit / totalInvested : 0,
      cagr,
      annualizedMoneyWeightedReturn,
      benchmarkReturnPct,
      maxDrawdown: maxDrawdown(series),
      units: last.units,
      purchases: sortedTransactions.length,
      firstPrice,
      lastPrice,
    },
    transactions: sortedTransactions,
    series,
  };
}
