require('dotenv').config();
const { app, runMigrations, syncDatabase } = require('./app');
const db = require('./models');
const { redis } = require('./config/redis.config');
const net = require('net');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis').default;

// Initialize passport
require('./config/passport')(passport);

// Check if port is free
const isPortFree = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => server.close(() => resolve(true)))
      .listen(port);
  });
};

const getAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortFree(port))) {
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
  }
  return port;
};

async function resetSequences() {
  try {
    console.log('Resetting sequences...');
    const tables = ['users', 'orders', 'products', 'reviews', 'supplychainevents'];
    for (const table of tables) {
      const [seqResult] = await db.sequelize.query(
        `SELECT pg_get_serial_sequence('${table}', 'id') as seq_name`
      );
      const seqName = seqResult[0]?.seq_name;
      if (!seqName) continue;
      await db.sequelize.query(
        `SELECT setval('${seqName}', (SELECT COALESCE(MAX(id), 0) + 1 FROM ${table}), false)`
      );
      console.log(`✔ Reset sequence for ${table}`);
    }
  } catch (err) {
    console.error('Error resetting sequences:', err.message);
  }
}

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

// Try Redis connection
(async () => {
  let useRedis = false;

  try {
    await redis.connect();
    console.log('✅ Redis connected');

    sessionConfig.store = new RedisStore({ client: redis });
    useRedis = true;
  } catch (err) {
    console.warn('⚠️ Redis unavailable. Falling back to in-memory sessions.');
  }

  // Attach session regardless
  app.use(session(sessionConfig));
  app.use(passport.initialize());
  app.use(passport.session());

  try {
    console.log('✅ Database status: OK');
    await runMigrations();
    await syncDatabase();
    await resetSequences();

    const startPort = Number(process.env.PORT || 8080);
    const port = await getAvailablePort(startPort);
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
