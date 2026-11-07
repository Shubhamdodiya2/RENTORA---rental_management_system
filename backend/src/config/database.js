const { Sequelize } = require('sequelize');
const env = require('./env');

let sequelize;

if (env.NODE_ENV === 'test') {
  // In-memory isolated dialect for fast automated testing
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // MySQL production / development dialect
  sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
    host: env.DB.HOST,
    port: env.DB.PORT,
    dialect: 'mysql',
    logging: env.NODE_ENV === 'development' ? (msg) => console.log(`[SQL] ${msg}`) : false,
    dialectOptions: env.DB.SSL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    pool: {
      max: env.DB.POOL.MAX,
      min: env.DB.POOL.MIN,
      acquire: env.DB.POOL.ACQUIRE,
      idle: env.DB.POOL.IDLE
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
}

module.exports = sequelize;
