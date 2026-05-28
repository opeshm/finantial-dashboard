import assert from 'node:assert/strict';
import test from 'node:test';
import { runDcaHistoricalSimulation, type PricePoint } from './dca-historical.simulator.js';

const businessDays: PricePoint[] = [
  { date: '2024-01-02', close: 10 },
  { date: '2024-01-03', close: 12 },
  { date: '2024-02-01', close: 15 },
  { date: '2024-03-01', close: 20 },
];

test('buys on the first available trading day and accumulates units', () => {
  const result = runDcaHistoricalSimulation(
    {
      symbol: 'TEST',
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      contributionBlocks: [
        {
          id: 'base',
          label: 'Mensual',
          startDate: '2024-01-01',
          endDate: '2024-03-01',
          amount: 100,
          frequency: 'monthly',
        },
      ],
    },
    businessDays,
  );

  assert.equal(result.transactions.length, 3);
  assert.equal(result.transactions[0].date, '2024-01-02');
  assert.equal(result.metrics.totalInvested, 300);
  assert.equal(Math.round(result.metrics.finalValue), 433);
  assert.equal(result.series.at(-1)?.invested, 300);
});

test('supports one-off manual contribution blocks', () => {
  const result = runDcaHistoricalSimulation(
    {
      symbol: 'TEST',
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      contributionBlocks: [
        {
          id: 'extra',
          label: 'Extra',
          startDate: '2024-02-15',
          endDate: '2024-03-01',
          amount: 500,
          frequency: 'once',
        },
      ],
    },
    businessDays,
  );

  assert.equal(result.transactions.length, 1);
  assert.equal(result.transactions[0].date, '2024-03-01');
  assert.equal(result.metrics.totalInvested, 500);
});

test('merges multiple contribution blocks sorted by execution date', () => {
  const result = runDcaHistoricalSimulation(
    {
      symbol: 'test',
      startDate: '2024-01-01',
      endDate: '2024-03-01',
      contributionBlocks: [
        {
          id: 'late',
          label: 'Late',
          startDate: '2024-03-01',
          endDate: '2024-03-01',
          amount: 200,
          frequency: 'once',
        },
        {
          id: 'early',
          label: 'Early',
          startDate: '2024-01-01',
          endDate: '2024-01-01',
          amount: 100,
          frequency: 'once',
        },
      ],
    },
    businessDays,
  );

  assert.deepEqual(result.transactions.map((transaction) => transaction.blockId), ['early', 'late']);
  assert.equal(result.symbol, 'TEST');
  assert.equal(result.metrics.purchases, 2);
});

test('ignores contributions scheduled after the simulation end date', () => {
  const result = runDcaHistoricalSimulation(
    {
      symbol: 'TEST',
      startDate: '2024-01-01',
      endDate: '2024-01-10',
      contributionBlocks: [
        {
          id: 'base',
          label: 'Inside',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
          amount: 100,
          frequency: 'once',
        },
        {
          id: 'late',
          label: 'After end',
          startDate: '2024-06-01',
          endDate: '2024-06-01',
          amount: 999,
          frequency: 'once',
        },
      ],
    },
    businessDays,
  );

  assert.equal(result.transactions.length, 1);
  assert.equal(result.transactions[0].blockId, 'base');
  assert.equal(result.metrics.totalInvested, 100);
});

test('returns null XIRR when cash flows are insufficient', () => {
  const result = runDcaHistoricalSimulation(
    {
      symbol: 'TEST',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      contributionBlocks: [
        {
          id: 'base',
          label: 'Base',
          startDate: '2024-01-04',
          endDate: '2024-01-04',
          amount: 100,
          frequency: 'once',
        },
      ],
    },
    businessDays.slice(0, 1),
  );

  assert.equal(result.metrics.annualizedMoneyWeightedReturn, null);
});

test('max drawdown returns the worst decline from peak', () => {
  const prices: PricePoint[] = [
    { date: '2024-01-02', close: 100 },
    { date: '2024-01-03', close: 110 },
    { date: '2024-01-04', close: 130 },
    { date: '2024-01-05', close: 90 },
    { date: '2024-01-08', close: 85 },
    { date: '2024-01-09', close: 95 },
  ];

  const result = runDcaHistoricalSimulation(
    {
      symbol: 'TEST',
      startDate: '2024-01-01',
      endDate: '2024-01-09',
      contributionBlocks: [
        {
          id: 'base',
          label: 'Base',
          startDate: '2024-01-01',
          endDate: '2024-01-01',
          amount: 100,
          frequency: 'once',
        },
      ],
    },
    prices,
  );

  const expected = (85 - 130) / 130;
  assert.equal(result.metrics.maxDrawdown, expected);
});

test('throws a clear error for empty price ranges', () => {
  assert.throws(
    () =>
      runDcaHistoricalSimulation(
        {
          symbol: 'TEST',
          startDate: '2023-01-01',
          endDate: '2023-02-01',
          contributionBlocks: [
            {
              id: 'base',
              label: 'Base',
              startDate: '2023-01-01',
              endDate: '2023-02-01',
              amount: 100,
              frequency: 'monthly',
            },
          ],
        },
        businessDays,
      ),
    /No hay precios disponibles/,
  );
});
