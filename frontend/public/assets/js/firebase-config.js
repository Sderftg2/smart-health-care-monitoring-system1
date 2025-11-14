const firebaseConfig = {
    apiKey: "AIzaSyDpF-98RgTGPOHy69Sm5sr6lt4WpPaGC40",
    authDomain: "smart-health-care-monito-d8ab0.firebaseapp.com",
    databaseURL: "https://smart-health-care-monito-d8ab0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-health-care-monito-d8ab0",
    storageBucket: "smart-health-care-monito-d8ab0.firebasestorage.app",
    messagingSenderId: "592595862489",
    appId: "1:592595862489:web:0e1076762a5b9379760fc8",
    measurementId: "G-GK3MBFTSGK"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

window.auth = auth;
window.database = database;

console.log('✅ Firebase initialized successfully!');
console.log('📊 Project:', firebaseConfig.projectId);

database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log('🟢 Connected to Firebase Database');
    } else {
        console.log('🔴 Disconnected from Firebase Database');
    }
});
