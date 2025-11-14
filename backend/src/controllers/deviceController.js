const { db } = require('../config/firebaseAdmin');
const alertService = require('../services/alertService');

exports.receiveDeviceData = async (req, res) => {
    try {
        const { deviceId, patientId, heartRate, spo2, temperature } = req.body;

        if (!deviceId || !patientId || !heartRate || !spo2 || !temperature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const dataPoint = {
            heartRate: parseFloat(heartRate),
            spo2: parseFloat(spo2),
            temperature: parseFloat(temperature),
            timestamp: Date.now()
        };

        await db.ref(`deviceData/${deviceId}`).push(dataPoint);
        await db.ref(`patients/${patientId}/latestData`).set(dataPoint);

        // Check for alerts
        await alertService.checkThresholds(patientId, dataPoint);

        console.log(`Data received from device ${deviceId}`);
        res.status(201).json({ message: 'Data saved successfully', data: dataPoint });
    } catch (error) {
        console.error('Error saving device data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLatestData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const snapshot = await db.ref(`deviceData/${deviceId}`)
            .orderByChild('timestamp')
            .limitToLast(1)
            .once('value');
        
        const data = snapshot.val();
        
        if (!data) {
            return res.status(404).json({ error: 'No data found' });
        }
        
        res.json({ data: Object.values(data)[0] });
    } catch (error) {
        console.error('Error fetching latest data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDataHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { limit = 100 } = req.query;
        
        const snapshot = await db.ref(`deviceData/${deviceId}`)
            .orderByChild('timestamp')
            .limitToLast(parseInt(limit))
            .once('value');
        
        const data = snapshot.val();
        
        res.json({ data: data || {} });
    } catch (error) {
        console.error('Error fetching data history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
