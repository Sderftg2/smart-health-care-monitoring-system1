const { db } = require('../src/config/firebaseAdmin');

async function initializeDatabase() {
    console.log('🔧 Initializing database structure...');
    
    try {
        const initialData = {
            patients: {
                PATIENT_001: {
                    name: "Test Patient",
                    age: 45,
                    gender: "Male",
                    contact: "+91 9876543210",
                    deviceId: "TEST_DEVICE_001",
                    createdAt: Date.now(),
                    latestData: {
                        heartRate: 75,
                        spo2: 98,
                        temperature: 36.8,
                        timestamp: Date.now()
                    }
                }
            }
        };
        
        await db.ref('/').update(initialData);
        console.log('✅ Database structure created successfully!');
        console.log('✅ Test patient created: PATIENT_001');
        console.log('\n🎉 Database initialization complete!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();
