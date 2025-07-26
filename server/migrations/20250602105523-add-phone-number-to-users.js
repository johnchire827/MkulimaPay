'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='phone_number'
    `);

    if (results.length === 0) {
      await queryInterface.addColumn('users', 'phone_number', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const [result] = await queryInterface.sequelize.query(`
      SELECT pg_type.typname
      FROM pg_type 
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      JOIN pg_attribute ON pg_attribute.atttypid = pg_type.oid
      JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
      WHERE pg_class.relname = 'users' 
        AND pg_attribute.attname = 'role'
      LIMIT 1;
    `);

    if (result.length > 0) {
      const enumTypeName = result[0].typname;

      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = '${enumTypeName}'::regtype 
            AND enumlabel = 'both'
          ) THEN
            ALTER TYPE "${enumTypeName}" ADD VALUE 'both' AFTER 'buyer';
          END IF;
        END;
        $$;
      `);
    }
  },

  async down(queryInterface) {
    // Remove the phone_number column
    await queryInterface.removeColumn('users', 'phone_number');
    
    // Note: Postgres doesn't directly support removing enum values
    // You would need to create a new type and migrate data
    // This is left as a comment since it's complex and often not needed
    /*
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ALTER COLUMN "role" TYPE text;
      DROP TYPE IF EXISTS "enum_users_role";
      CREATE TYPE "enum_users_role" AS ENUM ('farmer', 'buyer');
      ALTER TABLE "users" ALTER COLUMN "role" TYPE "enum_users_role" USING "role"::text::"enum_users_role";
    `);
    */
  }
};

