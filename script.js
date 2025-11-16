const circle = document.querySelector('.circle');
const phaseText = document.getElementById('phase');
const startBtn = document.getElementById('startBtn'); 
const stopBtn = document.getElementById('stopBtn');
const timerText = document.getElementById('timer');
const progressText = document.getElementById('progress');

let running = false;
let startTime, timerInterval, breathingLoop;
const ROUND_DURATION = 5 * 60 * 1000; // 5 min
const DAILY_TARGET = 2;

function getTodayKey() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getProgress() {
  const data = JSON.parse(localStorage.getItem('breathingData')) || {};
  const today = getTodayKey();
  return data[today] || 0;
}

function saveProgress(rounds) {
  const data = JSON.parse(localStorage.getItem('breathingData')) || {};
  const today = getTodayKey();
  data[today] = rounds;
  localStorage.setItem('breathingData', JSON.stringify(data));
}

function updateProgressDisplay() {
  progressText.textContent = `Today's rounds: ${getProgress()} / ${DAILY_TARGET}`;
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const sec = String(totalSec % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    timerText.textContent = formatTime(elapsed);
    if (elapsed >= ROUND_DURATION) endRound();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function startCycle() {
  phaseText.textContent = 'Inhale... (4s)';
  circle.style.transition = 'transform 4s ease-in-out';
  circle.style.transform = 'scale(1.5)';

  breathingLoop = setTimeout(() => {
    phaseText.textContent = 'Hold... (7s)';
    circle.style.transition = 'transform 7s ease-in-out';
    circle.style.transform = 'scale(1.5)';

    breathingLoop = setTimeout(() => {
      phaseText.textContent = 'Exhale... (8s)';
      circle.style.transition = 'transform 8s ease-in-out';
      circle.style.transform = 'scale(1)';

      breathingLoop = setTimeout(startCycle, 8000);
    }, 7000);
  }, 4000);
}

function startRound() {
  if (running) return;
  running = true;
  startCycle();
  startTimer();
}

function stopRound() {
  running = false;
  clearTimeout(breathingLoop);
  stopTimer();
  phaseText.textContent = 'Paused';
  circle.style.transform = 'scale(1)';
}

function endRound() {
  stopRound();
  const current = getProgress();
  if (current < DAILY_TARGET) {
    saveProgress(current + 1);
    updateProgressDisplay();
  }
  phaseText.textContent = 'Round Complete ✅';
}

startBtn.addEventListener('click', startRound);
stopBtn.addEventListener('click', stopRound);

updateProgressDisplay();
