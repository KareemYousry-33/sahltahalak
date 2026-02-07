const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const customInput = document.getElementById('custom-time');
const setCustomBtn = document.getElementById('set-custom-btn');

// Login & Avatar
const loginOverlay = document.getElementById('login-overlay');
const loginBtn = document.getElementById('login-btn');
const studentNameInput = document.getElementById('student-name');
const mainContainer = document.getElementById('main-container');
const greetingText = document.getElementById('greeting');
const profileContainer = document.getElementById('profile-container');
let selectedGender = 'boy'; // Default

// Timer State
let timerInterval;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;

// Setup Circle
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0; // Start full

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.title = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} - SahltahaLak`;

    // Invert progress for countdown effect (full to empty)
    const percent = (remainingSeconds / totalSeconds) * 100;
    setProgress(percent);
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
            finishTimer();
        }
    }, 1000);
}

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    alert("Focus Session Complete! عاش يا بطل! 🔥");
    resetTimer();
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    pauseBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
}

function resetTimer() {
    pauseTimer();
    remainingSeconds = totalSeconds;
    updateDisplay();
    setProgress(100);
}

function setTime(minutes) {
    pauseTimer();
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
    setProgress(100);
}

// Gender Selection
window.selectGender = function (gender) {
    selectedGender = gender;
    document.getElementById('opt-boy').classList.remove('selected');
    document.getElementById('opt-girl').classList.remove('selected');
    document.getElementById(`opt-${gender}`).classList.add('selected');
}

function setAvatar() {
    profileContainer.innerHTML = ''; // Clear
    if (selectedGender === 'boy') {
        profileContainer.innerHTML = `<img src="assets/img/boy_avatar.png" class="profile-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/4140/4140048.png'">`;
        // Fallback or use Icon if image fails
        const img = profileContainer.querySelector('img');
        img.onerror = () => {
            profileContainer.innerHTML = `<div class="profile-img avatar-icon-img"><i class="fas fa-user-graduate" style="color: #00f2ff;"></i></div>`;
        };
    } else {
        profileContainer.innerHTML = `<img src="assets/img/girl_avatar.png" class="profile-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/4140/4140047.png'">`;
        const img = profileContainer.querySelector('img');
        img.onerror = () => {
            profileContainer.innerHTML = `<div class="profile-img avatar-icon-img"><i class="fas fa-user-astronaut" style="color: #bc13fe;"></i></div>`;
        };
    }
}

function login() {
    const name = studentNameInput.value.trim();
    if (name) {
        greetingText.textContent = `أهلاً يا ${name} 👋`;
        setAvatar();
        loginOverlay.classList.add('hidden');
        mainContainer.classList.remove('blurred');
    } else {
        alert("اكتب اسمك الأول 😉");
    }
}

// Particle System
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;

        particlesContainer.appendChild(particle);
    }
}

// Events
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setTime(parseInt(btn.getAttribute('data-time')));
    });
});

setCustomBtn.addEventListener('click', () => {
    const mins = parseInt(customInput.value);
    if (mins && mins > 0) {
        presetBtns.forEach(b => b.classList.remove('active'));
        setTime(mins);
    }
});

loginBtn.addEventListener('click', login);
studentNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') login(); });

// Init
updateDisplay();
createParticles();
