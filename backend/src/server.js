const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function bootstrap() {
  try {
    console.log('[Rentora Backend] Initializing server...');
    
    // Test MySQL connection
    await sequelize.authenticate();
    console.log(`[MySQL Database] Successfully connected to database: ${env.DB.NAME} on ${env.DB.HOST}:${env.DB.PORT}`);

    // Start Express HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`[Rentora API] Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[Rentora API] Health Check URL: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      console.log(`\n[Rentora Server] Received ${signal}. Closing gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('[MySQL Connection] Pool closed cleanly.');
          process.exit(0);
        } catch (err) {
          console.error('[Shutdown Error]:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (error) {
    console.error('[Fatal Error]: Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();
