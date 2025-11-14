let allAlerts = [];

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    loadAlerts();
    setupEventListeners();
    setupLogout();
});

async function loadAlerts() {
    const alertsRef = database.ref('alerts');
    
    alertsRef.on('value', (snapshot) => {
        const alerts = snapshot.val();
        
        if (!alerts) {
            document.getElementById('alertsList').innerHTML = '<p>No alerts found</p>';
            return;
        }
        
        allAlerts = Object.entries(alerts).map(([id, data]) => ({
            id,
            ...data
        }));
        
        updateStats();
        displayAlerts('all');
    });
}

function updateStats() {
    const critical = allAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
    const warning = allAlerts.filter(a => a.severity === 'warning' && a.status === 'active').length;
    const resolved = allAlerts.filter(a => a.status === 'resolved').length;
    
    document.getElementById('criticalCount').textContent = critical;
    document.getElementById('warningCount').textContent = warning;
    document.getElementById('resolvedCount').textContent = resolved;
}

function displayAlerts(filter) {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
    let filteredAlerts = allAlerts;
    if (filter !== 'all') {
        filteredAlerts = allAlerts.filter(a => a.severity === filter || a.status === filter);
    }
    
    filteredAlerts.sort((a, b) => b.createdAt - a.createdAt).forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-item ${alert.severity} ${alert.status}`;
        alertDiv.innerHTML = `
            <div class="alert-header">
                <span class="severity-badge ${alert.severity}">${alert.severity}</span>
                <span class="time">${new Date(alert.createdAt).toLocaleString()}</span>
            </div>
            <h4>${alert.message}</h4>
            <p>Patient ID: ${alert.patientId}</p>
            ${alert.vitals ? `
                <div class="alert-vitals">
                    <span>HR: ${alert.vitals.heartRate} bpm</span>
                    <span>SpO2: ${alert.vitals.spo2}%</span>
                    <span>Temp: ${alert.vitals.temperature}°C</span>
                </div>
            ` : ''}
            ${alert.status === 'active' ? `
                <button onclick="resolveAlert('${alert.id}')">Resolve</button>
            ` : `<span class="resolved-label">Resolved</span>`}
        `;
        alertsList.appendChild(alertDiv);
    });
}

async function resolveAlert(alertId) {
    await database.ref(`alerts/${alertId}`).update({
        status: 'resolved',
        resolvedAt: Date.now()
    });
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            displayAlerts(e.target.dataset.tab);
        });
    });
    
    document.getElementById('markAllRead').addEventListener('click', async () => {
        const updates = {};
        allAlerts.filter(a => a.status === 'active').forEach(alert => {
            updates[`alerts/${alert.id}/acknowledged`] = true;
        });
        await database.ref().update(updates);
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
