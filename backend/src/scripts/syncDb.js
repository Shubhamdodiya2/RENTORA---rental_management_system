const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('[DB Sync] Connecting to MySQL database...');
    await sequelize.authenticate();
    console.log('[DB Sync] MySQL connection verified.');

    const isForce = process.argv.includes('--force');
    const isAlter = process.argv.includes('--alter') || !isForce;

    const modelCount = Object.keys(sequelize.models).length;
    console.log(`[DB Sync] Synchronizing all ${modelCount} models (alter: ${isAlter}, force: ${isForce})...`);
    await sequelize.sync({ force: isForce, alter: isAlter });

    console.log(`✅ [DB Sync] All ${modelCount} database tables synchronized successfully with indexes and foreign keys!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ [DB Sync Error]:', error);
    process.exit(1);
  }
}

syncDatabase();
