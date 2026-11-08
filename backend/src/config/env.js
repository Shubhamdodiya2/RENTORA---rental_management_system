const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory or process cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    NAME: process.env.DB_NAME || 'rentora_db',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    SSL: process.env.DB_SSL === 'true',
    POOL: {
      MAX: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      MIN: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      ACQUIRE: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      IDLE: parseInt(process.env.DB_POOL_IDLE, 10) || 10000
    }
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'rentora_jwt_default_secret_dev_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET || 'rentora_refresh_default_secret_dev_2026',
    REFRESH_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  ENCRYPTION_KEY: process.env.APP_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  SEED_CONFIG: {
    ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'superadmin@rentora.in',
    ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'AdminSecure2026!',
    DEMO_CUSTOMER_PASSWORD: process.env.SEED_DEMO_CUSTOMER_PASSWORD || 'DemoCustomer2026!',
    DEMO_VENDOR_PASSWORD: process.env.SEED_DEMO_VENDOR_PASSWORD || 'DemoVendor2026!'
  }
};
