import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { assetPresets } from '../../market-data/asset-presets.js';
import { getCurrency, getHistoricalPrices } from '../../market-data/yahoo-market-data.provider.js';
import { HistoryQuerySchema, SimulationRequestSchema } from './dca-historical.schema.js';
import { runDcaHistoricalSimulation } from './dca-historical.simulator.js';

function sendValidationError(reply: FastifyReply, error: z.ZodError): void {
  reply.code(400).send({ error: 'Configuracion invalida.', details: error.issues });
}

export async function registerDcaHistoricalRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/assets', async () => ({ presets: assetPresets }));

  app.get('/api/history', async (request, reply) => {
    const parsed = HistoryQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const prices = await getHistoricalPrices(parsed.data.symbol, parsed.data.startDate, parsed.data.endDate);
    if (prices.length === 0) {
      return reply.code(404).send({ error: 'No hay historico disponible para ese activo y rango.' });
    }

    return { symbol: parsed.data.symbol.toUpperCase(), prices };
  });

  app.post('/api/simulate', async (request, reply) => {
    const parsed = SimulationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return sendValidationError(reply, parsed.error);
    }

    const prices = await getHistoricalPrices(parsed.data.symbol, parsed.data.startDate, parsed.data.endDate);
    const currency = await getCurrency(parsed.data.symbol);

    if (prices.length === 0) {
      return reply.code(404).send({ error: 'No hay historico disponible para ese activo y rango.' });
    }

    return { ...runDcaHistoricalSimulation(parsed.data, prices), currency };
  });
}
