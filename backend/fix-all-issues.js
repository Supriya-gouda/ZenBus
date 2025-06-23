const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAllIssues() {
  let connection;
  
  try {
    console.log('🔧 Fixing all reported issues...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'bus_reservation_system'
    });

    // 1. Fix feedback table - add admin_response and response_date columns
    console.log('🔧 Fixing feedback table...');
    const [feedbackCols] = await connection.query('DESCRIBE feedback');
    const feedbackColumnNames = feedbackCols.map(col => col.Field);
    
    if (!feedbackColumnNames.includes('admin_response')) {
      console.log('➕ Adding admin_response column to feedback table...');
      await connection.query('ALTER TABLE feedback ADD COLUMN admin_response TEXT');
    }
    
    if (!feedbackColumnNames.includes('response_date')) {
      console.log('➕ Adding response_date column to feedback table...');
      await connection.query('ALTER TABLE feedback ADD COLUMN response_date TIMESTAMP NULL');
    }
    
    console.log('✅ Feedback table fixed');

    // 2. Check buses table structure
    console.log('🔧 Checking buses table...');
    const [busCols] = await connection.query('DESCRIBE buses');
    console.log('📊 Buses table columns:');
    busCols.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // 3. Add sample feedback data if none exists
    const [feedbackCount] = await connection.query('SELECT COUNT(*) as count FROM feedback');
    if (feedbackCount[0].count === 0) {
      console.log('➕ Adding sample feedback data...');
      
      // First, get some booking IDs
      const [bookings] = await connection.query('SELECT booking_id, user_id FROM bookings LIMIT 3');
      
      if (bookings.length > 0) {
        for (const booking of bookings) {
          await connection.query(`
            INSERT INTO feedback (user_id, booking_id, rating, comments, feedback_date) VALUES
            (?, ?, 4, 'Great service! Very comfortable journey.', NOW())
          `, [booking.user_id, booking.booking_id]);
        }
        console.log('✅ Sample feedback data added');
      }
    }

    // 4. Add sample admin responses to existing feedback
    const [feedbackWithoutResponse] = await connection.query(
      'SELECT feedback_id FROM feedback WHERE admin_response IS NULL LIMIT 2'
    );
    
    if (feedbackWithoutResponse.length > 0) {
      console.log('➕ Adding sample admin responses...');
      for (const feedback of feedbackWithoutResponse) {
        await connection.query(`
          UPDATE feedback 
          SET admin_response = 'Thank you for your feedback! We appreciate your review and will continue to improve our services.', 
              response_date = NOW() 
          WHERE feedback_id = ?
        `, [feedback.feedback_id]);
      }
      console.log('✅ Sample admin responses added');
    }

    console.log('🎉 All issues fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing issues:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  fixAllIssues()
    .then(() => {
      console.log('✅ All fixes completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixAllIssues;
