const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cams_mms';
const shouldUseSSL = (process.env.DB_SSL === 'true') || (/railway/i.test(DATABASE_URL)) || (process.env.NODE_ENV === 'production');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  dialectOptions: shouldUseSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️  Unable to connect to the database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
};

