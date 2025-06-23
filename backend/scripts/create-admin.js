const bcrypt = require('bcrypt');
const db = require('../db/connection');

async function createAdmin() {
  try {
    // Create admins table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert admin user
    await db.execute(`
      INSERT IGNORE INTO admins (username, password, full_name) 
      VALUES (?, ?, ?)
    `, ['admin', hashedPassword, 'System Administrator']);

    // Verify admin exists
    const [admins] = await db.execute('SELECT admin_id, username, full_name FROM admins');
    console.log('Admin users:', admins);

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
