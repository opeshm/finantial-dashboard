import yahooFinance from 'yahoo-finance2';
import type { PricePoint } from '../simulations/dca-historical/dca-historical.simulator.js';

const yahoo = new yahooFinance();
const CACHE_TTL_MS = 60 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  prices: PricePoint[];
};

const priceCache = new Map<string, CacheEntry>();
const currencyCache = new Map<string, string>();

function addDays(date: string, days: number): Date {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function getHistoricalPrices(symbol: string, startDate: string, endDate: string): Promise<PricePoint[]> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const cacheKey = `${normalizedSymbol}:${startDate}:${endDate}`;
  const cached = priceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.prices;
  }

  const rows = (await yahoo.historical(normalizedSymbol, {
    period1: addDays(startDate, -7),
    period2: addDays(endDate, 2),
    interval: '1d',
  })) as Array<{ date: Date; close?: number | null; adjClose?: number | null }>;

  const prices = rows
    .map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      close: Number(row.adjClose ?? row.close),
    }))
    .filter((point) => point.date >= startDate && point.date <= endDate && Number.isFinite(point.close) && point.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  priceCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, prices });
  return prices;
}

export async function getCurrency(symbol: string): Promise<string> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const cached = currencyCache.get(normalizedSymbol);

  if (cached) {
    return cached;
  }

  const quote = (await yahoo.quote(normalizedSymbol)) as { currency?: string };
  const currency = quote.currency ?? 'EUR';
  currencyCache.set(normalizedSymbol, currency);
  return currency;
}
