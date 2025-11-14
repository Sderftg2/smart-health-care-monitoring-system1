document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('error-message');

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                const userDoc = await database.ref(`users/${user.uid}`).once('value');
                const userData = userDoc.val();
                
                if (userData && userData.role === 'doctor') {
                    window.location.href = 'dashboard.html';
                } else if (userData && userData.role === 'patient') {
                    window.location.href = 'patient.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                errorMsg.textContent = '❌ ' + error.message;
                errorMsg.style.display = 'block';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorMsg = document.getElementById('error-message');
            const successMsg = document.getElementById('success-message');

            if (password !== confirmPassword) {
                errorMsg.textContent = '❌ Passwords do not match';
                errorMsg.style.display = 'block';
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                await database.ref(`users/${user.uid}`).set({
                    name: name,
                    email: email,
                    role: role,
                    createdAt: Date.now()
                });

                successMsg.textContent = '✅ Account created successfully! Redirecting...';
                successMsg.style.display = 'block';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                errorMsg.textContent = '❌ ' + error.message;
                errorMsg.style.display = 'block';
            }
        });
    }
});

auth.onAuthStateChanged((user) => {
    const publicPages = ['index.html', 'login.html', 'register.html', 'contact.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }
});
