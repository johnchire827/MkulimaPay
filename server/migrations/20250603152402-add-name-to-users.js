'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'name'
    `);

    if (results.length === 0) {
      await queryInterface.addColumn('users', 'name', {
        type: Sequelize.STRING,
        allowNull: true, // or false, based on your needs
      });
    } else {
      console.log('Column "name" already exists in "users" table. Skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'name');
  }
};

