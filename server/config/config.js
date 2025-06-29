// config/config.js
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Environment-specific configuration
const getConfig = (env) => {
  // Base configuration
  const config = {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgress',
    database: process.env.DB_NAME || 'mkulima_pay',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  };

  // Environment-specific overrides
  if (env === 'test') {
    config.database = process.env.DB_NAME_TEST || 'mkulima_test';
  }

  if (env === 'production') {
    config.use_env_variable = 'DATABASE_URL';
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
    delete config.host;
    delete config.port;
    delete config.username;
    delete config.password;
  }

  return config;
};

module.exports = {
  development: getConfig('development'),
  test: getConfig('test'),
  production: getConfig('production')
};