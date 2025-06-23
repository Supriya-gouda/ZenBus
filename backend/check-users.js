const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function checkUsers() {
  let connection;
  
  try {
    console.log('🔍 Checking user data...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // Check existing users
    const [users] = await connection.query('SELECT * FROM users');
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length > 0) {
      console.log('👥 Existing users:');
      users.forEach(user => {
        console.log(`  - ID: ${user.user_id}, Email: ${user.email}, Name: ${user.full_name}`);
      });
    }

    // Check if we need to create sample users with proper passwords
    if (users.length === 0) {
      console.log('➕ Creating sample users...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await connection.query(`
        INSERT INTO users (full_name, email, phone, password, status) VALUES
        ('John Doe', 'user1@example.com', '9876543210', ?, 'Active'),
        ('Jane Smith', 'user2@example.com', '9876543211', ?, 'Active')
      `, [hashedPassword, hashedPassword]);
      
      console.log('✅ Sample users created with password: password123');
    } else {
      // Check if passwords are properly hashed
      const testUser = users[0];
      console.log(`🔐 Testing password for user: ${testUser.email}`);
      
      try {
        const isValidHash = await bcrypt.compare('password123', testUser.password);
        if (isValidHash) {
          console.log('✅ Password hash is valid');
        } else {
          console.log('❌ Password hash is invalid, updating...');
          
          // Update all users with proper hashed passwords
          const hashedPassword = await bcrypt.hash('password123', 10);
          
          for (const user of users) {
            await connection.query(
              'UPDATE users SET password = ? WHERE user_id = ?',
              [hashedPassword, user.user_id]
            );
          }
          
          console.log('✅ All user passwords updated to: password123');
        }
      } catch (error) {
        console.log('❌ Password is not properly hashed, updating...');
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        for (const user of users) {
          await connection.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, user.user_id]
          );
        }
        
        console.log('✅ All user passwords updated to: password123');
      }
    }

    // Test login functionality
    console.log('\n🧪 Testing login functionality...');
    
    const [testUsers] = await connection.query('SELECT * FROM users LIMIT 1');
    if (testUsers.length > 0) {
      const testUser = testUsers[0];
      const isPasswordValid = await bcrypt.compare('password123', testUser.password);
      
      if (isPasswordValid) {
        console.log(`✅ Login test successful for ${testUser.email}`);
        console.log('📋 Test credentials:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: password123`);
      } else {
        console.log('❌ Login test failed');
      }
    }

    console.log('\n🎉 User data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('✅ Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

module.exports = checkUsers;
