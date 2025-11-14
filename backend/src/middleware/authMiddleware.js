const { auth } = require('../config/firebaseAdmin');

exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
};
