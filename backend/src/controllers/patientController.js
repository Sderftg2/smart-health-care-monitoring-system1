const { db } = require('../config/firebaseAdmin');

exports.getAllPatients = async (req, res) => {
    try {
        const snapshot = await db.ref('patients').once('value');
        const patients = snapshot.val() || {};
        res.json({ patients });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.ref(`patients/${id}`).once('value');
        const patient = snapshot.val();
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json({ patient });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createPatient = async (req, res) => {
    try {
        const { name, age, gender, contact, doctorId, deviceId } = req.body;
        
        const patientData = {
            name,
            age,
            gender,
            contact,
            doctorId,
            deviceId,
            createdAt: Date.now()
        };
        
        const patientRef = await db.ref('patients').push(patientData);
        res.status(201).json({ id: patientRef.key, ...patientData });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        await db.ref(`patients/${id}`).update(updates);
        res.json({ message: 'Patient updated successfully' });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`patients/${id}`).remove();
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
