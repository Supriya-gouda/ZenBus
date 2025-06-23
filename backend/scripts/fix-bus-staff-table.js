const db = require('../db/connection');

async function fixBusStaffTable() {
  try {
    // Check current table structure
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'bus_staff'
    `);
    
    console.log('Current columns:', columns.map(c => c.COLUMN_NAME));
    
    // Add missing columns if they don't exist
    const requiredColumns = [
      { name: 'email', type: 'VARCHAR(100) NULL' },
      { name: 'address', type: 'TEXT NULL' },
      { name: 'date_of_joining', type: 'DATE NULL' },
      { name: 'salary', type: 'DECIMAL(10,2) NULL' }
    ];
    
    for (const column of requiredColumns) {
      const exists = columns.some(c => c.COLUMN_NAME === column.name);
      if (!exists) {
        console.log(`Adding column: ${column.name}`);
        await db.execute(`
          ALTER TABLE bus_staff 
          ADD COLUMN ${column.name} ${column.type}
        `);
      } else {
        console.log(`Column ${column.name} already exists`);
      }
    }
    
    console.log('Bus staff table structure fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing bus staff table:', error);
    process.exit(1);
  }
}

fixBusStaffTable();
