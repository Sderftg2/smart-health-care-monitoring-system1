document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: Date.now()
    };
    
    try {
        await database.ref('contactMessages').push(formData);
        
        const formMessage = document.getElementById('formMessage');
        formMessage.style.background = '#d4edda';
        formMessage.style.color = '#155724';
        formMessage.style.padding = '1rem';
        formMessage.style.borderRadius = '10px';
        formMessage.textContent = '✅ Thank you! Your message has been sent successfully.';
        
        document.getElementById('contactForm').reset();
        
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.style.padding = '0';
        }, 5000);
    } catch (error) {
        const formMessage = document.getElementById('formMessage');
        formMessage.style.background = '#f8d7da';
        formMessage.style.color = '#721c24';
        formMessage.style.padding = '1rem';
        formMessage.style.borderRadius = '10px';
        formMessage.textContent = '❌ Error sending message. Please try again.';
    }
});
