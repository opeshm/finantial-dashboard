import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerDcaHistoricalRoutes } from './simulations/dca-historical/dca-historical.routes.js';
import { registerAuthRoutes } from './auth/presentation/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicAvatarsDir = path.resolve(__dirname, '../public/avatars');

// Ensure local static avatars directory exists
await fs.mkdir(publicAvatarsDir, { recursive: true });

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 4312);

await app.register(cors, {
  origin: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
});

await app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max avatar file size
  },
});

await app.register(fastifyStatic, {
  root: publicAvatarsDir,
  prefix: '/avatars/',
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
