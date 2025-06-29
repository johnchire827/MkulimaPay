'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Update existing NULL values
    await queryInterface.sequelize.query(`
      UPDATE users SET name = '' WHERE name IS NULL
    `);
    
    // Step 2: Change column to NOT NULL
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
