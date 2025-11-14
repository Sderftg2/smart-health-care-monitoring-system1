let isRunning = false;
let intervalId = null;
let dataCount = 0;

const heartRateSlider = document.getElementById('heartRate');
const spo2Slider = document.getElementById('spo2');
const tempSlider = document.getElementById('temperature');
const hrValue = document.getElementById('hrValue');
const spo2Value = document.getElementById('spo2Value');
const tempValue = document.getElementById('tempValue');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusIndicator = document.getElementById('statusIndicator');
const logContainer = document.getElementById('logContainer');

heartRateSlider.addEventListener('input', (e) => {
    hrValue.textContent = e.target.value;
});

spo2Slider.addEventListener('input', (e) => {
    spo2Value.textContent = e.target.value;
});

tempSlider.addEventListener('input', (e) => {
    tempValue.textContent = e.target.value;
});

startBtn.addEventListener('click', () => {
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusIndicator.style.background = '#28a745';
    statusIndicator.style.animation = 'pulse 2s infinite';
    
    intervalId = setInterval(sendData, 5000);
    addLog('✅ Transmission started');
    sendData(); // Send immediately
});

stopBtn.addEventListener('click', () => {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusIndicator.style.background = '#dc3545';
    statusIndicator.style.animation = 'none';
    
    clearInterval(intervalId);
    addLog('⏸️ Transmission stopped');
});

async function sendData() {
    const patientId = document.getElementById('patientId').value;
    const deviceId = document.getElementById('deviceId').value;
    
    const dataPoint = {
        deviceId,
        patientId,
        heartRate: parseFloat(heartRateSlider.value),
        spo2: parseFloat(spo2Slider.value),
        temperature: parseFloat(tempSlider.value),
        timestamp: Date.now()
    };
    
    try {
        await database.ref(`deviceData/${deviceId}`).push(dataPoint);
        await database.ref(`patients/${patientId}/latestData`).set(dataPoint);
        
        dataCount++;
        addLog(`📤 Data #${dataCount}: HR=${dataPoint.heartRate} SpO2=${dataPoint.spo2}% Temp=${dataPoint.temperature}°C`);
    } catch (error) {
        addLog(`❌ Error: ${error.message}`);
    }
}

function addLog(message) {
    const time = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${time}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    statusIndicator.style.background = '#dc3545';
});
