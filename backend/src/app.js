const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const deviceRoutes = require('./routes/deviceRoutes');
const patientRoutes = require('./routes/patientRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🏥 Smart Healthcare Monitoring System API',
        version: '1.0.0',
        endpoints: {
            devices: '/api/devices',
            patients: '/api/patients',
            alerts: '/api/alerts',
            health: '/health'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

module.exports = app;
