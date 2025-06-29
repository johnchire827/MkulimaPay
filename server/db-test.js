const { Sequelize } = require('sequelize');

async function testConnection() {
  try {
    // Update with your actual credentials
    const sequelize = new Sequelize({
      database: 'mkulima_pay',
      username: 'postgres',
      password: 'postgress',
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: console.log
    });
    
    await sequelize.authenticate();
    console.log('? PostgreSQL connection successful!');
    
    // Test query
    const [result] = await sequelize.query('SELECT version()');
    console.log('PostgreSQL version:', result[0].version);
    
    process.exit(0);
  } catch (error) {
    console.error('? Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
