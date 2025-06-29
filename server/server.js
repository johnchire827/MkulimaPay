require('dotenv').config();
const { app, runMigrations, syncDatabase } = require('./app');
const db = require('./models');  // This now has db.sequelize defined
const { redis } = require('./config/redis.config');
const net = require('net');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis').default;

// Initialize passport
require('./config/passport')(passport);

// Function to check if port is available
const isPortFree = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close(() => resolve(true));
      })
      .listen(port);
  });
};

// Find next available port
const getAvailablePort = async (startPort) => {
  let port = startPort;
  while (!await isPortFree(port)) {
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
  }
  return port;
};

async function resetSequences() {
  try {
    console.log('Resetting sequences to prevent ID conflicts...');
    
    const tables = ['users', 'orders', 'products', 'reviews', 'supplychainevents'];
    
    for (const table of tables) {
      try {
        const [seqResult] = await db.sequelize.query(
          `SELECT pg_get_serial_sequence('${table}', 'id') as seq_name`
        );
        
        const seqName = seqResult[0]?.seq_name;
        if (!seqName) {
          console.log(`No sequence found for table ${table}, skipping`);
          continue;
        }
        
        await db.sequelize.query(
          `SELECT setval('${seqName}', (SELECT COALESCE(MAX(id), 0) + 1 FROM ${table}), false)`
        );
        
        console.log(`Reset sequence for ${table} using ${seqName}`);
      } catch (err) {
        console.error(`Error resetting sequence for ${table}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error resetting sequences:', error);
  }
}

// Session configuration with Redis store
const sessionConfig = {
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

// Add session middleware
app.use(session(sessionConfig));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Test Redis connection
redis.connect().then(async () => {
  console.log('Redis connected successfully');
  
  try {
    // Database connection is already established in models/index.js
    console.log('Database connection status: OK');
    
    // Run migrations
    await runMigrations();
    
    // Sync models
    await syncDatabase();
    
    // Reset sequences
    await resetSequences();
    
    // Find available port
    const startPort = Number(process.env.PORT || 8080);
    const port = await getAvailablePort(startPort);
    
    // Start HTTP server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🔗 Access it at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Redis connection error:', err);
  process.exit(1);
});