const { db } = require('../src/config/firebaseAdmin');

async function generateTestData() {
    console.log('🚀 Generating test data for charts...\n');
    
    const patientId = 'PATIENT_001';
    const deviceId = 'TEST_DEVICE_001';
    
    // Generate data for last 24 hours (50 data points)
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const interval = (now - oneDayAgo) / 50;
    
    console.log(`📊 Generating 50 data points for ${patientId}...\n`);
    
    for (let i = 0; i < 50; i++) {
        const timestamp = oneDayAgo + (interval * i);
        
        // Realistic varying data
        const baseHR = 72;
        const hrVariation = Math.sin(i / 5) * 15 + Math.random() * 10 - 5;
        const heartRate = Math.round(baseHR + hrVariation);
        
        const baseSpo2 = 97;
        const spo2Variation = Math.random() * 3 - 1;
        const spo2 = Math.round(baseSpo2 + spo2Variation);
        
        const baseTemp = 36.8;
        const tempVariation = Math.random() * 0.6 - 0.3;
        const temperature = (baseTemp + tempVariation).toFixed(1);
        
        const dataPoint = {
            deviceId,
            patientId,
            heartRate,
            spo2,
            temperature: parseFloat(temperature),
            timestamp
        };
        
        // Add to deviceData
        await db.ref(`deviceData/${deviceId}`).push(dataPoint);
        
        // Update latest data on last iteration
        if (i === 49) {
            await db.ref(`patients/${patientId}/latestData`).set(dataPoint);
        }
        
        if ((i + 1) % 10 === 0) {
            console.log(`✅ Generated ${i + 1}/50 data points`);
        }
    }
    
    console.log('\n🎉 Test data generation complete!');
    console.log(`📊 Generated 50 historical readings`);
    console.log(`⏰ Time range: Last 24 hours`);
    console.log(`\n✅ Now refresh patient-details.html to see charts!`);
    
    process.exit(0);
}

generateTestData().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
