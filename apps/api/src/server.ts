import cors from '@fastify/cors';
import Fastify from 'fastify';
import { registerDcaHistoricalRoutes } from './simulations/dca-historical/dca-historical.routes.js';
import { registerAuthRoutes } from './auth/presentation/auth.routes.js';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4312);

await app.register(cors, {
  origin: true,
});

app.get('/health', async () => ({ ok: true }));
await registerDcaHistoricalRoutes(app);
await registerAuthRoutes(app);

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  const message = error instanceof Error ? error.message : 'Error inesperado.';
  reply.code(500).send({ error: message });
});

await app.listen({ port, host: '0.0.0.0' });
