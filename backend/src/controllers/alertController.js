const { db } = require('../config/firebaseAdmin');

exports.getAllAlerts = async (req, res) => {
    try {
        const snapshot = await db.ref('alerts').once('value');
        const alerts = snapshot.val() || {};
        res.json({ alerts });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAlertById = async (req, res) => {
    try {
        const { id } = req.params;
        const snapshot = await db.ref(`alerts/${id}`).once('value');
        const alert = snapshot.val();
        
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        
        res.json({ alert });
    } catch (error) {
        console.error('Error fetching alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.ref(`alerts/${id}`).update({
            status: 'resolved',
            resolvedAt: Date.now()
        });
        
        res.json({ message: 'Alert resolved successfully' });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        await db.ref(`alerts/${id}`).remove();
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
