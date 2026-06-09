const sequelize = require('./database');
const models = require('../models');

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with the database
    // Using alter: true to add new columns (like courseField on Subjects)
    try {
      // By default, do a safe sync (create missing tables only). Running `alter: true` can attempt
      // potentially breaking DDL operations when the DB schema has drifted; enable only explicitly.
      await sequelize.sync();
      console.log('Database synchronized successfully (safe sync).');

      if (process.env.ALLOW_DB_ALTER === 'true') {
        try {
          await sequelize.sync({ alter: true });
          console.log('Database synchronized with alter: true');
        } catch (alterErr) {
          console.error('Database sync (alter) failed:', alterErr && alterErr.message ? alterErr.message : alterErr);
        }
      }
    } catch (syncErr) {
      console.error('Database sync failed:', syncErr && syncErr.message ? syncErr.message : syncErr);
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // If we can't connect at all, exit as the app cannot function without DB
    process.exit(1);
  }
}

module.exports = initDatabase;