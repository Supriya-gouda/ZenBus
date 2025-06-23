const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixBusStaff() {
  let connection;
  
  try {
    console.log('🔧 Fixing bus_staff table...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Check bus_staff table structure
    const [columns] = await connection.query('DESCRIBE bus_staff');
    console.log('📊 Bus staff table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Add email column if it doesn't exist
    const columnNames = columns.map(col => col.Field);
    if (!columnNames.includes('email')) {
      console.log('➕ Adding email column to bus_staff table...');
      await connection.query('ALTER TABLE bus_staff ADD COLUMN email VARCHAR(100)');
      console.log('✅ Email column added');
    }

    // Check if we need to add sample data
    const [staffCount] = await connection.query('SELECT COUNT(*) as count FROM bus_staff');
    if (staffCount[0].count === 0) {
      console.log('➕ Adding sample bus staff...');
      await connection.query(`
        INSERT INTO bus_staff (full_name, role, contact_number, email, address, salary, status) VALUES
        ('Ramesh Conductor', 'Conductor', '9876543213', 'ramesh@zenbus.com', '321 Service St, Bangalore', 25000.00, 'Active'),
        ('Ganesh Cleaner', 'Cleaner', '9876543214', 'ganesh@zenbus.com', '654 Clean Ave, Mumbai', 18000.00, 'Active'),
        ('Prakash Mechanic', 'Mechanic', '9876543215', 'prakash@zenbus.com', '987 Repair Rd, Chennai', 35000.00, 'Active')
      `);
      console.log('✅ Sample bus staff added');
    } else {
      console.log(`✅ Bus staff table already has ${staffCount[0].count} records`);
    }

    console.log('🎉 Bus staff table fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing bus staff table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  fixBusStaff()
    .then(() => {
      console.log('✅ Fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixBusStaff;
