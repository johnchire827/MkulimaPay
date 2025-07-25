'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'location'
    `);

    if (results.length === 0) {
      await queryInterface.addColumn('users', 'location', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } else {
      console.log('Column "location" already exists in "users" table. Skipping...');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'location');
  }
};

