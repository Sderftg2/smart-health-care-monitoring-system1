const { db } = require('../config/firebaseAdmin');

const THRESHOLDS = {
    heartRate: { min: 60, max: 100 },
    spo2: { min: 90, max: 100 },
    temperature: { min: 36.1, max: 37.2 }
};

exports.checkThresholds = async (patientId, dataPoint) => {
    const alerts = [];

    if (dataPoint.heartRate < THRESHOLDS.heartRate.min) {
        alerts.push({ type: 'heartRate', severity: 'critical', message: 'Heart rate too low' });
    } else if (dataPoint.heartRate > THRESHOLDS.heartRate.max) {
        alerts.push({ type: 'heartRate', severity: 'warning', message: 'Heart rate elevated' });
    }

    if (dataPoint.spo2 < THRESHOLDS.spo2.min) {
        alerts.push({ type: 'spo2', severity: 'critical', message: 'Low oxygen saturation' });
    }

    if (dataPoint.temperature < THRESHOLDS.temperature.min || dataPoint.temperature > THRESHOLDS.temperature.max) {
        alerts.push({ type: 'temperature', severity: 'warning', message: 'Abnormal temperature' });
    }

    if (alerts.length > 0) {
        for (const alert of alerts) {
            await this.createAlert(patientId, alert, dataPoint);
        }
    }
};

exports.createAlert = async (patientId, alert, dataPoint) => {
    try {
        const alertData = {
            patientId,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            vitals: dataPoint,
            status: 'active',
            createdAt: Date.now()
        };

        const alertRef = await db.ref('alerts').push(alertData);
        console.log(`Alert created for patient ${patientId}: ${alert.message}`);
        return alertRef.key;
    } catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
};
