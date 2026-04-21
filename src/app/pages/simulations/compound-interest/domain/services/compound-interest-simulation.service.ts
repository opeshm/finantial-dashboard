import { Injectable } from '@angular/core';
import {
  CompoundInterestConfigData,
  DcaRange,
  DcaRangeDraft,
  SimulationSummary,
  YearlyProjection,
  createEmptySummary,
} from '../models/compound-interest.models';

@Injectable({ providedIn: 'root' })
export class CompoundInterestSimulationService {
  simulate(data: CompoundInterestConfigData): {
    yearlyProjection: YearlyProjection[];
    summary: SimulationSummary;
  } {
    const years = this.normalizeInteger(data.simulationYears, 1, 50);
    const initialCapital = this.normalizeNumber(data.initialCapital, 0);
    const annualGrowthRate = this.normalizeNumber(data.annualGrowthRate, 0);
    const monthlyRate = Math.pow(1 + annualGrowthRate / 100, 1 / 12) - 1;

    const dcaRanges = data.dcaRanges
      .map((range) => ({
        ...range,
        startYear: this.normalizeInteger(range.startYear, 1, years),
        endYear: this.normalizeInteger(range.endYear, 1, years),
        amount: this.normalizeNumber(range.amount, 0),
      }))
      .filter((range) => range.amount > 0 && range.endYear >= range.startYear);

    const extraContributions = data.extraContributions
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

    return {
      yearlyProjection,
      summary: this.buildSummary(yearlyProjection, initialCapital, cumulativeDca, cumulativeExtra, cumulativeInterest),
    };
  }

  createDefaultDcaDraft(simulationYears: number): DcaRangeDraft {
    return {
      label: '',
      startYear: 1,
      endYear: Math.max(1, this.normalizeInteger(simulationYears, 1, 50)),
      amount: 250,
      frequency: 'monthly',
    };
  }

  normalizeNumber(value: number, minimum: number): number {
    if (!Number.isFinite(Number(value))) {
      return minimum;
    }

    return Math.max(minimum, Number(value));
  }

  normalizeInteger(value: number, minimum: number, maximum: number): number {
    if (!Number.isFinite(Number(value))) {
      return minimum;
    }

    return Math.min(maximum, Math.max(minimum, Math.floor(Number(value))));
  }

  getNextId(ids: number[]): number {
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  normalizeConfigData(data: CompoundInterestConfigData): CompoundInterestConfigData {
    const simulationYears = this.normalizeInteger(data.simulationYears, 1, 50);

    return {
      initialCapital: this.normalizeNumber(data.initialCapital, 0),
      annualGrowthRate: this.normalizeNumber(data.annualGrowthRate, 0),
      simulationYears,
      dcaRanges: (data.dcaRanges ?? []).map((item, index) => ({
        id: index + 1,
        label: item.label || `Tramo ${index + 1}`,
        startYear: this.normalizeInteger(item.startYear, 1, simulationYears),
        endYear: this.normalizeInteger(item.endYear, 1, simulationYears),
        amount: this.normalizeNumber(item.amount, 0),
        frequency: item.frequency,
      })),
      extraContributions: (data.extraContributions ?? []).map((item, index) => ({
        id: index + 1,
        label: item.label || `Extra ${index + 1}`,
        year: this.normalizeInteger(item.year, 1, simulationYears),
        month: this.normalizeInteger(item.month, 1, 12),
        amount: this.normalizeNumber(item.amount, 0),
      })),
    };
  }

  private buildSummary(
    yearlyProjection: YearlyProjection[],
    initialCapital: number,
    cumulativeDca: number,
    cumulativeExtra: number,
    cumulativeInterest: number,
  ): SimulationSummary {
    if (!yearlyProjection.length) {
      return createEmptySummary();
    }

    const totalContributions = cumulativeDca + cumulativeExtra;
    const totalInvested = initialCapital + totalContributions;
    const finalBalance = totalInvested + cumulativeInterest;
    const bestYear = yearlyProjection.reduce<YearlyProjection | null>((best, item) => {
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
}
