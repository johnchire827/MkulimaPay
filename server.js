const { app, runMigrations, syncDatabase } = require('./app');

const PORT = process.env.PORT || 10000;

(async () => {
  try {
    await runMigrations();
    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
})();