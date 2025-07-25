require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');
const { uploadDir } = require('./utils/fileUpload');
const { Umzug, SequelizeStorage } = require('umzug');

// Create express app instance
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


// Serve static files


// Custom request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Import route files
const authRoutes = require('./routes/api/v1/auth');
const paymentRoutes = require('./routes/api/v1/paymentRoutes'); // NEW
// To this:
const productRoutes = require('./routes/api/v1/productRoutes');
const aiRoutes = require('./routes/api/v1/aiRoutes');

const ussdRoutes = require('./routes/ussd');
const errorHandler = require('./middleware/error');
const reviewRoutes = require('./routes/reviewRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const supplyChainRoutes = require('./routes/supplyChainRoutes');
const healthCheckRoutes = require('./routes/api/v1/healthCheck');
const bidRoutes = require('./routes/api/v1/bidRoutes');
const routeLogger = require('./middleware/routeLogger');
const orderRoutes = require('./routes/api/v1/orderRoutes');
const transactionRoutes = require('./routes/api/v1/transactionRoutes');
const userRoutes = require('./routes/api/v1/userRoutes');
const productVerificationRoutes = require('./routes/productVerification');

// Add with other route imports
const instoreSaleRoutes = require('./routes/instoreSaleRoutes');
// Add this line with other route imports
const routes = require('./routes/routes'); 




// Routes
// Add this before your routes
app.use('/api/v1', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/ussd', ussdRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/supply-chain', supplyChainRoutes);
app.use('/api/v1/farmers', farmerRoutes);
app.use('/api/v1/health', healthCheckRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/products', require('./routes/api/v1/productRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/users', userRoutes);
// CORRECTED VERIFICATION ROUTE - matches client request
app.use('/api/v1/product-verification', productVerificationRoutes);
// Add with other app.use routes
app.use('/api/v1/instore-sales', instoreSaleRoutes);
// Add this line with other route usage


// Mount product routes

app.use(routeLogger);
// Database Migration System
const runMigrations = async () => {
  try {
    const umzug = new Umzug({
      migrations: { glob: path.join(__dirname, 'migrations/*.js') },
      context: db.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ 
        sequelize: db.sequelize,
        modelName: 'migration_meta'
      }),
      logger: console,
    });

    const pending = await umzug.pending();
    console.log(`${pending.length} migrations pending`);

    const migrations = await umzug.up();
    console.log(`${migrations.length} migrations executed successfully`);
    return migrations;
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Database Sync
const syncDatabase = async () => {
  try {
    // Sync all models
    await db.sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Database sync error:', error);
    throw error;
  }
};

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.use(errorHandler);

// Export functions for server.js
module.exports = {
  app,
  runMigrations,
  syncDatabase
};