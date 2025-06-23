const db = require('../db/connection');

async function fixDriversTable() {
  try {
    // Check current table structure
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'drivers'
    `);
    
    console.log('Current columns:', columns.map(c => c.COLUMN_NAME));
    
    // Add missing columns if they don't exist
    const requiredColumns = [
      { name: 'address', type: 'TEXT NULL' },
      { name: 'date_of_birth', type: 'DATE NULL' },
      { name: 'emergency_contact', type: 'VARCHAR(20) NULL' },
      { name: 'status', type: 'ENUM("Active", "On Leave", "Inactive") DEFAULT "Active"' }
    ];
    
    for (const column of requiredColumns) {
      const exists = columns.some(c => c.COLUMN_NAME === column.name);
      if (!exists) {
        console.log(`Adding column: ${column.name}`);
        await db.execute(`
          ALTER TABLE drivers 
          ADD COLUMN ${column.name} ${column.type}
        `);
      } else {
        console.log(`Column ${column.name} already exists`);
      }
    }
    
    console.log('Drivers table structure fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing drivers table:', error);
    process.exit(1);
  }
}

fixDriversTable();
