// migrations/XXXXXXXXXXXXXX-fix-user-timestamps.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add created_at with default value
    await queryInterface.addColumn('users', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.fn('NOW')
    });
    
    // Step 2: Add updated_at with default value
    await queryInterface.addColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.fn('NOW')
    });
    
    // Step 3: Update existing rows
    await queryInterface.sequelize.query(`
      UPDATE users SET 
        created_at = NOW() - INTERVAL '1 day' * RANDOM() * 30,
        updated_at = NOW()
      WHERE created_at IS NULL OR updated_at IS NULL
    `);
    
    // Step 4: Change to NOT NULL
    await queryInterface.changeColumn('users', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false
    });
    
    await queryInterface.changeColumn('users', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'created_at');
    await queryInterface.removeColumn('users', 'updated_at');
  }
};
