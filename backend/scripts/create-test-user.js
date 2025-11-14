const { auth, db } = require('../src/config/firebaseAdmin');

async function createTestUser() {
    try {
        console.log('👨‍⚕️ Creating test doctor account...');
        
        const userRecord = await auth.createUser({
            email: 'doctor@test.com',
            password: 'test123456',
            displayName: 'Dr. Test Doctor'
        });
        
        console.log('✅ Auth user created:', userRecord.uid);
        
        await db.ref(`users/${userRecord.uid}`).set({
            name: 'Dr. Test Doctor',
            email: 'doctor@test.com',
            role: 'doctor',
            specialization: 'Cardiology',
            phone: '+91 9876543210',
            createdAt: Date.now()
        });
        
        console.log('✅ User data saved to database');
        console.log('\n📧 Login Credentials:');
        console.log('   Email: doctor@test.com');
        console.log('   Password: test123456');
        console.log('\n🎉 Test user created successfully!');
        
        process.exit(0);
        
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('ℹ️  User already exists: doctor@test.com');
            process.exit(0);
        }
        console.error('❌ Error creating user:', error);
        process.exit(1);
    }
}

createTestUser();
