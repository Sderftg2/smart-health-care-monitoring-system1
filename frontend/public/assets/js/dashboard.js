let heartRateChart, spo2Chart;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await database.ref(`users/${user.uid}`).once('value');
    const userData = userDoc.val();
    
    if (userData) {
        document.getElementById('userInfo').textContent = `Welcome, Dr. ${userData.name}`;
    }

    loadPatients();
    loadStats();
    initializeCharts();
    setupLogout();
});

async function loadPatients() {
    const patientsRef = database.ref('patients');
    
    patientsRef.on('value', (snapshot) => {
        const patients = snapshot.val();
        const patientsList = document.getElementById('patientsList');
        patientsList.innerHTML = '';
        
        if (!patients) {
            patientsList.innerHTML = '<p>No patients found</p>';
            return;
        }

        Object.entries(patients).forEach(([id, patient]) => {
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            patientCard.innerHTML = `
                <h4>${patient.name || 'Unknown Patient'}</h4>
                <div class="vitals">
                    <span class="vital">HR: ${patient.latestData?.heartRate || 'N/A'} bpm</span>
                    <span class="vital">SpO2: ${patient.latestData?.spo2 || 'N/A'}%</span>
                    <span class="vital">Temp: ${patient.latestData?.temperature || 'N/A'}°C</span>
                </div>
                <button onclick="viewPatientDetails('${id}')">View Details</button>
            `;
            patientsList.appendChild(patientCard);
        });
    });
}

async function loadStats() {
    const patientsSnapshot = await database.ref('patients').once('value');
    const alertsSnapshot = await database.ref('alerts').once('value');
    
    const patients = patientsSnapshot.val();
    const alerts = alertsSnapshot.val();
    
    const totalPatients = patients ? Object.keys(patients).length : 0;
    const activeAlerts = alerts ? Object.values(alerts).filter(a => a.status === 'active').length : 0;
    
    let criticalCases = 0;
    if (patients) {
        Object.values(patients).forEach(patient => {
            if (patient.latestData?.heartRate > 100 || patient.latestData?.spo2 < 90) {
                criticalCases++;
            }
        });
    }
    
    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('activeAlerts').textContent = activeAlerts;
    document.getElementById('criticalCases').textContent = criticalCases;
}

function initializeCharts() {
    const ctxHR = document.getElementById('heartRateChart').getContext('2d');
    heartRateChart = new Chart(ctxHR, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 50,
                    max: 120
                }
            }
        }
    });

    const ctxSpO2 = document.getElementById('spo2Chart').getContext('2d');
    spo2Chart = new Chart(ctxSpO2, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'SpO2 (%)',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 85,
                    max: 100
                }
            }
        }
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}

function viewPatientDetails(patientId) {
    window.location.href = `patient.html?id=${patientId}`;
}
