// State management
let timerState = {
  isRunning: false,
  isPaused: false,
  currentMode: 'focus', // 'focus' or 'break'
  focusDuration: 25,
  breakDuration: 5,
  breakType: 'diffuse',
  timeRemaining: 25 * 60,
  interval: null
};

// DOM elements
const timeDisplay = document.getElementById('time-display');
const timerLabel = document.getElementById('timer-label');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timerDisplay = document.querySelector('.timer-display');

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Time button selection
document.querySelectorAll('.time-btn').forEach(button => {
  button.addEventListener('click', () => {
    if (timerState.isRunning) return;
    
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const minutes = parseInt(button.dataset.minutes);
    timerState.focusDuration = minutes;
    timerState.timeRemaining = minutes * 60;
    updateDisplay();
    updateStatus();
  });
});

// Break button selection
document.querySelectorAll('.break-btn').forEach(button => {
  button.addEventListener('click', () => {
    if (timerState.isRunning) return;
    
    document.querySelectorAll('.break-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const minutes = parseInt(button.dataset.minutes);
    const type = button.dataset.type;
    timerState.breakDuration = minutes;
    timerState.breakType = type;
    updateStatus();
  });
});

// Start button
startBtn.addEventListener('click', () => {
  if (!timerState.isRunning) {
    startTimer();
  }
});

// Pause button
pauseBtn.addEventListener('click', () => {
  if (timerState.isRunning && !timerState.isPaused) {
    pauseTimer();
  } else if (timerState.isPaused) {
    resumeTimer();
  }
});

// Reset button
resetBtn.addEventListener('click', () => {
  resetTimer();
});

// Timer functions
function startCountdown() {
  // Start local countdown for display
  timerState.interval = setInterval(() => {
    timerState.timeRemaining--;
    updateDisplay();
    
    if (timerState.timeRemaining <= 0) {
      timerComplete();
    }
  }, 1000);
}

function startTimer() {
  timerState.isRunning = true;
  timerState.isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  
  if (timerState.currentMode === 'focus') {
    timerDisplay.classList.add('running');
    timerLabel.textContent = 'Focus Time - Stay Concentrated!';
  } else {
    timerDisplay.classList.add('break');
    timerLabel.textContent = `Break Time - ${timerState.breakType === 'diffuse' ? 'Diffuse Mode' : 'Restful Wakefulness'}`;
  }
  
  updateStatus();
  
  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'startTimer',
    duration: timerState.timeRemaining,
    mode: timerState.currentMode,
    breakType: timerState.breakType
  });
  
  startCountdown();
}

function pauseTimer() {
  timerState.isPaused = true;
  clearInterval(timerState.interval);
  pauseBtn.textContent = 'Resume';
  timerDisplay.classList.remove('running', 'break');
  timerDisplay.classList.add('paused');
  timerLabel.textContent = 'Paused';
  
  chrome.runtime.sendMessage({ action: 'pauseTimer' });
}

function resumeTimer() {
  timerState.isPaused = false;
  pauseBtn.textContent = 'Pause';
  timerDisplay.classList.remove('paused');
  
  if (timerState.currentMode === 'focus') {
    timerDisplay.classList.add('running');
    timerLabel.textContent = 'Focus Time - Stay Concentrated!';
  } else {
    timerDisplay.classList.add('break');
    timerLabel.textContent = `Break Time - ${timerState.breakType === 'diffuse' ? 'Diffuse Mode' : 'Restful Wakefulness'}`;
  }
  
  chrome.runtime.sendMessage({ action: 'resumeTimer' });
  
  startCountdown();
}

function resetTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.currentMode = 'focus';
  timerState.timeRemaining = timerState.focusDuration * 60;
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';
  
  timerDisplay.classList.remove('running', 'paused', 'break');
  timerLabel.textContent = 'Ready to focus';
  
  updateDisplay();
  updateStatus();
  
  chrome.runtime.sendMessage({ action: 'resetTimer' });
}

function timerComplete() {
  clearInterval(timerState.interval);
  
  // Switch between focus and break
  if (timerState.currentMode === 'focus') {
    timerState.currentMode = 'break';
    timerState.timeRemaining = timerState.breakDuration * 60;
    timerState.isRunning = false;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    timerDisplay.classList.remove('running');
    timerDisplay.classList.add('break');
    timerLabel.textContent = `Break Ready - ${timerState.breakType === 'diffuse' ? 'Diffuse Mode' : 'Restful Wakefulness'}`;
    statusText.textContent = `Focus complete! Take a ${timerState.breakDuration} minute ${timerState.breakType === 'diffuse' ? 'diffuse mode' : 'restful wakefulness'} break.`;
    
  } else {
    timerState.currentMode = 'focus';
    timerState.timeRemaining = timerState.focusDuration * 60;
    timerState.isRunning = false;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    timerDisplay.classList.remove('break');
    timerLabel.textContent = 'Ready to focus';
    statusText.textContent = 'Break complete! Ready for another focus session?';
  }
  
  updateDisplay();
  
  chrome.runtime.sendMessage({ action: 'timerComplete', mode: timerState.currentMode });
}

function updateDisplay() {
  const minutes = Math.floor(timerState.timeRemaining / 60);
  const seconds = timerState.timeRemaining % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateStatus() {
  if (!timerState.isRunning) {
    if (timerState.currentMode === 'focus') {
      statusText.textContent = `Ready to start ${timerState.focusDuration} minute focus session`;
    } else {
      statusText.textContent = `Ready to start ${timerState.breakDuration} minute ${timerState.breakType === 'diffuse' ? 'diffuse mode' : 'restful wakefulness'} break`;
    }
  } else if (timerState.isPaused) {
    statusText.textContent = 'Timer paused - click Resume to continue';
  } else {
    if (timerState.currentMode === 'focus') {
      statusText.textContent = 'Focus session in progress...';
    } else {
      statusText.textContent = `${timerState.breakType === 'diffuse' ? 'Diffuse mode' : 'Restful wakefulness'} break in progress...`;
    }
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'timerTick') {
    timerState.timeRemaining = message.timeRemaining;
    updateDisplay();
  }
});

// Initialize display
updateDisplay();
updateStatus();
