const db = require('../db/connection');

async function addUserStatusColumn() {
  try {
    // Check if status column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
    `);

    if (columns.length === 0) {
      // Add status column if it doesn't exist
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'blocked') DEFAULT 'active'
      `);
      console.log('Status column added to users table successfully!');
    } else {
      console.log('Status column already exists in users table.');
    }
    
    // Update existing users to have active status
    await db.execute(`
      UPDATE users SET status = 'active' WHERE status IS NULL
    `);
    
    console.log('User status column setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding user status column:', error);
    process.exit(1);
  }
}

addUserStatusColumn();
