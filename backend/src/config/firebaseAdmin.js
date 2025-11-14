const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccount = require(path.join(__dirname, '../../firebase-admin-key.json'));

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('📊 Project ID:', serviceAccount.project_id);
    
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
}

const db = admin.database();
const auth = admin.auth();

module.exports = { admin, db, auth };
