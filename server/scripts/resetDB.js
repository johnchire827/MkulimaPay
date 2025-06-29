// scripts/resetDB.js
const { exec } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const resetDB = async () => {
  console.log('Resetting database...');
  
  try {
    // Terminate active connections
    await execCommand(`psql -U ${process.env.DB_USER} -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${process.env.DB_NAME}' AND pid <> pg_backend_pid();"`);
    
    // Drop and recreate database
    await execCommand(`psql -U ${process.env.DB_USER} -c "DROP DATABASE IF EXISTS ${process.env.DB_NAME}"`);
    await execCommand(`psql -U ${process.env.DB_USER} -c "CREATE DATABASE ${process.env.DB_NAME}"`);
    
    console.log('Database reset complete');
  } catch (error) {
    console.error('Database reset failed:', error);
  }
};

const execCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing: ${cmd}`, stderr);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
};

resetDB();