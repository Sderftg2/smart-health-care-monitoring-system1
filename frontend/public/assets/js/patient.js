let heartRateChart, spo2Chart;
let patientId = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userDoc = await database.ref(`users/${user.uid}`).once('value');
    const userData = userDoc.val();
    
    if (userData.role !== 'patient') {
        window.location.href = 'dashboard.html';
        return;
    }

    patientId = user.uid;
    document.getElementById('patientInfo').textContent = userData.name;

    loadPatientData();
    initializeCharts();
    loadRecentAlerts();
    setupLogout();
});

function loadPatientData() {
    const patientRef = database.ref(`patients/${patientId}/latestData`);
    
    patientRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) return;

        updateVitalDisplay('heartRate', data.heartRate, 'bpm', 60, 100);
        updateVitalDisplay('spo2', data.spo2, '%', 90, 100);
        updateVitalDisplay('temperature', data.temperature, '°C', 36.1, 37.2);
        
        document.getElementById('lastUpdate').textContent = new Date(data.timestamp).toLocaleTimeString();
    });
}

function updateVitalDisplay(vitalId, value, unit, minNormal, maxNormal) {
    const element = document.getElementById(vitalId);
    const statusElement = document.getElementById(`${vitalId}Status`);
    
    if (!element) return;
    
    element.textContent = `${value.toFixed(1)} ${unit}`;
    
    if (statusElement) {
        if (value < minNormal) {
            statusElement.textContent = 'Low';
            statusElement.className = 'vital-status critical';
        } else if (value > maxNormal) {
            statusElement.textContent = 'High';
            statusElement.className = 'vital-status warning';
        } else {
            statusElement.textContent = 'Normal';
            statusElement.className = 'vital-status';
        }
    }
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
                borderColor: 'rgb(255, 107, 107)',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                borderColor: 'rgb(79, 172, 254)',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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

async function loadRecentAlerts() {
    const alertsRef = database.ref('alerts').orderByChild('patientId').equalTo(patientId);
    const snapshot = await alertsRef.limitToLast(5).once('value');
    const alerts = snapshot.val();
    
    const alertsList = document.getElementById('recentAlerts');
    alertsList.innerHTML = '';
    
    if (!alerts) {
        alertsList.innerHTML = '<p>No alerts</p>';
        return;
    }
    
    Object.entries(alerts).reverse().forEach(([id, alert]) => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.severity}`;
        alertDiv.innerHTML = `
            <strong>${alert.message}</strong>
            <p>${new Date(alert.createdAt).toLocaleString()}</p>
        `;
        alertsList.appendChild(alertDiv);
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
