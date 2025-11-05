// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://thompsonsoftwares:FeK8SA4pEJGuxZiA@cluster0.47uma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI);

async function updateAdminPassword() {
  try {
    const email = 'admin@investours.com';
    const newPassword = 'AdminPass123!';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 👇 UPDATE existing user instead of inserting
    const result = await mongoose.connection.collection('users').updateOne(
      { email: email },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          isCompleteProfile: true,
          tier: 'Exclusive'
        }
      }
    );
    
    if (result.matchedCount === 0) {
      console.log('⚠️ Admin user not found. Creating new one...');
      await mongoose.connection.collection('users').insertOne({
        fullName: 'Admin User',
        email: email,
        phone: '+2348000000000',
        password: hashedPassword,
        country: 'Nigeria',
        userType: 'individual',
        role: 'admin',
        isVerified: true,
        isCompleteProfile: true,
        tier: 'Exclusive'
      });
      console.log('✅ New admin user created!');
    } else {
      console.log('✅ Admin password and role updated successfully!');
    }
    
    console.log('📧 Email: admin@investours.com');
    console.log('🔑 Password: AdminPass123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminPassword();