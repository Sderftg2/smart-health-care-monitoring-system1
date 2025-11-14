const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');
const { sendContactFormEmail, sendConfirmationEmail } = require('../services/emailService');

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Save to Firebase
        const contactData = {
            name,
            email,
            subject,
            message,
            timestamp: Date.now(),
            status: 'new'
        };
        
        const messageRef = await db.ref('contactMessages').push(contactData);
        console.log('✅ Message saved to Firebase:', messageRef.key);
        
        // Send email to admin
        try {
            await sendContactFormEmail({ name, email, subject, message });
            console.log('✅ Email sent to admin');
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            // Continue even if email fails
        }
        
        // Send confirmation to sender
        try {
            await sendConfirmationEmail(email, name);
            console.log('✅ Confirmation sent to sender');
        } catch (confirmError) {
            console.error('❌ Confirmation email failed:', confirmError);
        }
        
        res.json({ 
            success: true, 
            message: 'Message sent successfully!',
            messageId: messageRef.key
        });
        
    } catch (error) {
        console.error('❌ Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again.' 
        });
    }
});

// Get all messages (admin only)
router.get('/messages', async (req, res) => {
    try {
        const snapshot = await db.ref('contactMessages').once('value');
        const messages = snapshot.val();
        
        if (!messages) {
            return res.json({ success: true, messages: [] });
        }
        
        const messagesArray = Object.entries(messages).map(([id, data]) => ({
            id,
            ...data
        }));
        
        res.json({ success: true, messages: messagesArray });
    } catch (error) {
        console.error('❌ Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

module.exports = router;
