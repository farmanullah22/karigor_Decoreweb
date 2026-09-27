const app = require('./app');
const env = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/db');

/**
 * Server entry point: connect to MongoDB first, then start listening.
 * Handles graceful shutdown and unhandled rejections.
 */
async function start() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Karigor Decore API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${signal} received - shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force-exit if shutdown hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[server] Unhandled rejection:', reason);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', error.message);
  process.exit(1);
});
