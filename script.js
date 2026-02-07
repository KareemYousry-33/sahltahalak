const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
const timeDisplay = document.getElementById('time-display');
const millisecondsDisplay = document.getElementById('milliseconds');
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
let selectedGender = null; // No Default

// Timer State
let timerInterval;
let totalSeconds = 25 * 60;
let remainingTimeMs = totalSeconds * 1000; // Track in milliseconds
let isRunning = false;

// Stopwatch State
let isStopwatch = false;
let stopwatchMs = 0; // Track in milliseconds
const modeTimerBtn = document.getElementById('mode-timer');
const modeStopwatchBtn = document.getElementById('mode-stopwatch');
const modeLabel = document.getElementById('mode-label');

// Setup Circle
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0; // Start full

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    let msToDisplay = isStopwatch ? stopwatchMs : remainingTimeMs;
    // Safety check
    if (msToDisplay < 0) msToDisplay = 0;

    const mins = Math.floor(msToDisplay / 60000);
    const secs = Math.floor((msToDisplay % 60000) / 1000);
    const ms = Math.floor((msToDisplay % 1000) / 10); // Show 2 digits for cleaner circle look

    // Timer Text
    timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    millisecondsDisplay.textContent = String(ms).padStart(2, '0');

    document.title = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} - SahltahaLak`;

    // Circle Progress
    if (isStopwatch) {
        // Stopwatch: Fill up every minute (0 -> 100%)
        const progressMs = msToDisplay % 60000;
        const percent = (progressMs / 60000) * 100;
        setProgress(percent);
    } else {
        // Timer: empty as it goes down
        const totalMs = totalSeconds * 1000;
        const percent = (msToDisplay / totalMs) * 100;
        setProgress(percent);
    }
}

// Sound Logic
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playMotivationalSound() {
    // Original "Success" Sound (Oscillator) - Now for Dhikr
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playWaterDropSound() {
    // Original "Dhikr" Sound (MP3) - Now for Timer Completion
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
}

// Modal Logic
const modal = document.getElementById('completion-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

function showModal() {
    modal.classList.add('visible');
    playWaterDropSound(); // Swapped: Timer End now plays Water Drop
}

function hideModal() {
    modal.classList.remove('visible');
}

closeModalBtn.addEventListener('click', hideModal);

function finishTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    showModal();
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
    if (isStopwatch) {
        stopwatchMs = 0;
        updateDisplay();
        circle.style.strokeDashoffset = circumference; // Empty
    } else {
        remainingTimeMs = totalSeconds * 1000;
        updateDisplay();
        setProgress(100);
    }
}

function setTime(minutes) {
    if (isStopwatch) return; // Ignore in stopwatch mode
    pauseTimer();
    totalSeconds = minutes * 60;
    remainingTimeMs = totalSeconds * 1000;
    updateDisplay();
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

// Warning Modal
function showWarning(message) {
    const modal = document.getElementById('warning-modal');
    const text = modal.querySelector('.warning-text');
    text.textContent = message;
    modal.classList.add('visible');

    // Sound effect for warning
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

window.hideWarning = function () {
    document.getElementById('warning-modal').classList.remove('visible');
    document.getElementById('student-name').focus();
}

function login() {
    const name = studentNameInput.value.trim();

    if (!selectedGender) {
        showWarning("يا بطل! اختار شخصيتك الأول (بطل ولا بطلة؟) 🤔");
        return;
    }

    if (!name) {
        showWarning("يا بطل! لازم تكتب اسمك الأول 😉");
        return;
    }

    greetingText.textContent = `أهلاً يا ${name} 👋`;
    setAvatar();
    loginOverlay.classList.add('hidden');
    mainContainer.classList.remove('blurred');
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

// Dhikr Logic
const dhikrList = [
    "سبحان الله",
    "الحمد لله",
    "لا إله إلا الله",
    "الله أكبر",
    "سبحان الله وبحمده",
    "سبحان الله العظيم",
    "أستغفر الله",
    "لا حول ولا قوة إلا بالله",
    "اللهم صل وسلم على نبينا محمد"
];

function showDhikr() {
    const toast = document.createElement('div');
    toast.className = 'dhikr-toast';
    const randomDhikr = dhikrList[Math.floor(Math.random() * dhikrList.length)];

    toast.innerHTML = `
        <i class="fas fa-moon"></i>
        <div class="dhikr-content">
            <h4>ذكر</h4>
            <p>${randomDhikr}</p>
        </div>
    `;

    document.body.appendChild(toast);

    playMotivationalSound(); // Swapped: Dhikr now plays Motivational Sound

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// Mode Switching
function switchMode(mode) {
    isStopwatch = (mode === 'stopwatch');

    if (isStopwatch) {
        modeStopwatchBtn.classList.add('active');
        modeTimerBtn.classList.remove('active');
        modeLabel.textContent = "Stopwatch";
        resetTimer();
    } else {
        modeTimerBtn.classList.add('active');
        modeStopwatchBtn.classList.remove('active');
        modeLabel.textContent = "Timer Focus";
        resetTimer();
    }
}

modeTimerBtn.addEventListener('click', () => switchMode('timer'));
modeStopwatchBtn.addEventListener('click', () => switchMode('stopwatch'));

// Events
startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');

    const TICK_RATE = 10;
    let lastTime = Date.now();

    timerInterval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;

        if (isStopwatch) {
            stopwatchMs += delta;
            updateDisplay();

            // Pulse/Dhikr every minute (60 * 1000 ms)
            // Just check if we crossed a minute boundary roughly. 
            // Simple check: floor(ms/60000) > floor((ms-delta)/60000)
            if (Math.floor(stopwatchMs / 60000) > Math.floor((stopwatchMs - delta) / 60000)) {
                showDhikr();
            }

        } else {
            remainingTimeMs -= delta;
            updateDisplay();

            // Dhikr every minute
            // Check if we crossed a minute boundary downwards
            if (Math.floor(remainingTimeMs / 60000) < Math.floor((remainingTimeMs + delta) / 60000) && remainingTimeMs > 1000) {
                showDhikr();
            }

            if (remainingTimeMs <= 0) {
                remainingTimeMs = 0;
                updateDisplay();
                finishTimer();
            }
        }
    }, TICK_RATE);
});

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

// Dhikr List Interactivity
// Dhikr List Interactivity
const dhikrItems = document.querySelectorAll('.dhikr-item');
const resetDhikrBtn = document.getElementById('reset-dhikr-btn');

function handleDhikrClick(item) {
    const badge = item.querySelector('.count-badge');
    let countText = badge.textContent;

    // Play sound
    playMotivationalSound();

    // Infinity case
    if (countText === '∞') {
        // Visual feedback only
        item.style.transform = 'scale(0.98)';
        setTimeout(() => item.style.transform = 'translateX(0)', 100);
        return;
    }

    let count = parseInt(countText);

    if (count > 0) {
        count--;
        badge.textContent = count;

        // Visual feedback
        item.style.transform = 'scale(0.95)';
        setTimeout(() => item.style.transform = 'translateX(0)', 100);

        if (count === 0) {
            // Completion effect
            setTimeout(() => {
                playWaterDropSound(); // Completion sound
                item.classList.add('completed');
            }, 200);
        }
    }
}

dhikrItems.forEach(item => {
    item.addEventListener('click', () => handleDhikrClick(item));
});

// Reset Dhikr Logic
if (resetDhikrBtn) {
    resetDhikrBtn.addEventListener('click', () => {
        dhikrItems.forEach(item => {
            const badge = item.querySelector('.count-badge');
            const originalCount = badge.getAttribute('data-original-count');

            // Generate a random delay for a staggered effect
            const delay = Math.random() * 300;

            // Remove cancelled state
            setTimeout(() => {
                item.classList.remove('completed');
                badge.textContent = originalCount;

                // Pop effect
                item.animate([
                    { transform: 'scale(0.5)', opacity: 0 },
                    { transform: 'scale(1.1)', opacity: 1 },
                    { transform: 'scale(1)', opacity: 1 }
                ], {
                    duration: 400,
                    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });
            }, delay);
        });

        // Play a "refresh" sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    });
}
