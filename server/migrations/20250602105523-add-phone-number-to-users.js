'use strict';

module.exports.up = async function (queryInterface, Sequelize) {
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
};


