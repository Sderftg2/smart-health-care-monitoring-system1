const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { db } = require('./config/firebaseAdmin');
const patientRoutes = require('./routes/patientRoutes');
const alertRoutes = require('./routes/alertRoutes');
const contactRoutes = require('./routes/contactRoutes'); // ← ADD THIS

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/contact', contactRoutes); // ← ADD THIS

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Smart Healthcare Monitoring System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            patients: '/api/patients',
            alerts: '/api/alerts',
            contact: '/api/contact' // ← ADD THIS
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('\n✅ Server running successfully!');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log('\n🏥 Smart Healthcare Monitoring System - Backend Active\n');
});

module.exports = app;
