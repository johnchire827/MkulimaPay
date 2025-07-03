'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    // Add created_at if it doesn't exist
    if (!table.created_at) {
      await queryInterface.addColumn('users', 'created_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW')
      });
    }

    // Add updated_at if it doesn't exist
    if (!table.updated_at) {
      await queryInterface.addColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('NOW')
      });
    }

    // Optional: Only run update if at least one column exists
    if (!table.created_at || !table.updated_at) {
      await queryInterface.sequelize.query(`
        UPDATE users SET 
          created_at = NOW() - INTERVAL '1 day' * RANDOM() * 30,
          updated_at = NOW()
        WHERE created_at IS NULL OR updated_at IS NULL
      `);
    }

    // Make columns NOT NULL (only if they now exist)
    if (!table.created_at) {
      await queryInterface.changeColumn('users', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false
      });
    }

    if (!table.updated_at) {
      await queryInterface.changeColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (table.created_at) {
      await queryInterface.removeColumn('users', 'created_at');
    }

    if (table.updated_at) {
      await queryInterface.removeColumn('users', 'updated_at');
    }
  }
};
