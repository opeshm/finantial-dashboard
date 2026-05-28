import { z } from 'zod';

export const FrequencySchema = z.enum(['once', 'weekly', 'monthly', 'quarterly', 'yearly']);

export const ContributionBlockSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
  amount: z.number().positive(),
  frequency: FrequencySchema,
});

export const SimulationRequestSchema = z.object({
  symbol: z.string().trim().min(1).max(32),
  startDate: z.string().date(),
  endDate: z.string().date(),
  contributionBlocks: z.array(ContributionBlockSchema).min(1),
});

export const HistoryQuerySchema = z.object({
  symbol: z.string().trim().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export type Frequency = z.infer<typeof FrequencySchema>;
export type ContributionBlock = z.infer<typeof ContributionBlockSchema>;
export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;
