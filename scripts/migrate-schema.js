const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/reputraq';
const client = postgres(connectionString, { prepare: false });

async function migrateSchema() {
  try {
    console.log('Migrating database schema...');
    
    // Drop the foreign key constraint
    await client`ALTER TABLE keywords DROP CONSTRAINT IF EXISTS keywords_user_id_users_id_fk`;
    
    // Change the column type from serial to integer
    await client`ALTER TABLE keywords ALTER COLUMN user_id TYPE integer`;
    
    // Add the foreign key constraint back (without CASCADE DELETE)
    await client`ALTER TABLE keywords ADD CONSTRAINT keywords_user_id_users_id_fk 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`;
    
    console.log('Schema migration completed successfully!');
  } catch (error) {
    console.error('Error migrating schema:', error);
  } finally {
    await client.end();
  }
}

migrateSchema();
