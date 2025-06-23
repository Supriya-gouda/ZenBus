const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDriverTable() {
  let connection;
  
  try {
    console.log('🔍 Checking driver table structure...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Check driver table structure
    const [columns] = await connection.query('DESCRIBE drivers');
    console.log('📊 Driver table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''} ${col.Default ? 'DEFAULT ' + col.Default : ''}`);
    });

    // Check sample data
    const [drivers] = await connection.query('SELECT * FROM drivers LIMIT 3');
    console.log('\n📋 Sample driver data:');
    drivers.forEach(driver => {
      console.log(`  - ID: ${driver.driver_id}, Name: ${driver.full_name}, License: ${driver.license_number}, Contact: ${driver.contact_number || 'N/A'}`);
    });

    console.log('\n🎉 Driver table check completed!');
    
  } catch (error) {
    console.error('❌ Error checking driver table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  checkDriverTable()
    .then(() => {
      console.log('✅ Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

module.exports = checkDriverTable;
