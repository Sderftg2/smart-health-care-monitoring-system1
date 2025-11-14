const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// Send contact form email
async function sendContactFormEmail(formData) {
    const { name, email, subject, message } = formData;
    
    const subjectLabels = {
        'general': 'General Inquiry',
        'support': 'Technical Support',
        'sales': 'Sales Inquiry'
    };
    
    const mailOptions = {
        from: `"SmartHealth System" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📧 Contact Form: ${subjectLabels[subject] || subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
                    .label { font-weight: bold; color: #667eea; display: block; margin-bottom: 5px; }
                    .value { color: #333; }
                    .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; color: #999; font-size: 0.9em; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 SmartHealth Contact Form</h1>
                        <p>New message received</p>
                    </div>
                    <div class="content">
                        <div class="info-row">
                            <span class="label">👤 From:</span>
                            <span class="value">${name}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">📧 Email:</span>
                            <span class="value"><a href="mailto:${email}">${email}</a></span>
                        </div>
                        <div class="info-row">
                            <span class="label">📋 Subject:</span>
                            <span class="value">${subjectLabels[subject] || subject}</span>
                        </div>
                        <div class="message-box">
                            <span class="label">💬 Message:</span>
                            <p class="value">${message}</p>
                        </div>
                        <div class="info-row">
                            <span class="label">🕐 Received:</span>
                            <span class="value">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This email was sent from SmartHealth Contact Form</p>
                        <p>Reply directly to this email to respond to ${name}</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        replyTo: email // Allow direct reply to sender
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error);
        throw error;
    }
}

// Send confirmation email to sender
async function sendConfirmationEmail(email, name) {
    const mailOptions = {
        from: `"SmartHealth Support" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: '✅ We received your message - SmartHealth',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 Thank You for Contacting Us!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${name},</p>
                        <p>Thank you for reaching out to SmartHealth. We have received your message and our team will respond within 24-48 hours.</p>
                        <p>In the meantime, feel free to explore our healthcare monitoring solutions.</p>
                        <p style="text-align: center;">
                            <a href="http://localhost:8000" class="button">Visit SmartHealth</a>
                        </p>
                        <p style="margin-top: 30px;">Best regards,<br><strong>SmartHealth Support Team</strong></p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to:', email);
    } catch (error) {
        console.error('❌ Confirmation email error:', error);
        // Don't throw - confirmation is optional
    }
}

module.exports = {
    sendContactFormEmail,
    sendConfirmationEmail
};
