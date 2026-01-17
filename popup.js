// Pomodoro Timer State
const state = {
  currentPhase: 'focus',
  selectedTimes: {
    focus: 25,
    retrieve: 3,
    rest: 3
  },
  timeRemaining: 25 * 60, // in seconds
  totalTime: 25 * 60,
  isRunning: false,
  sessionCount: 0,
  timerInterval: null
};

// DOM Elements
const elements = {
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  phaseIcon: document.getElementById('phase-icon'),
  phaseName: document.getElementById('phase-name'),
  timerDisplay: document.getElementById('timer-display'),
  progressBar: document.getElementById('progress-bar'),
  startBtn: document.getElementById('start-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  resetBtn: document.getElementById('reset-btn'),
  phaseBtns: document.querySelectorAll('.phase-btn'),
  sessionCount: document.getElementById('session-count'),
  phaseDisplay: document.querySelector('.phase-display')
};

// Phase configurations
const phaseConfig = {
  focus: {
    name: 'Focus Time',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>`,
    iconClass: 'focus-icon',
    progressClass: ''
  },
  retrieve: {
    name: 'Retrieve (Diffuse Mode)',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>`,
    iconClass: 'retrieve-icon',
    progressClass: 'retrieve'
  },
  rest: {
    name: 'Restful Wakefulness',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 7.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5v4.5l3.5 2.1c.24.14.55.07.68-.17.14-.24.07-.55-.17-.68L12.5 11.5V7.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>`,
    iconClass: 'rest-icon',
    progressClass: 'rest'
  }
};

// Initialize
function init() {
  loadState();
  setupEventListeners();
  updateDisplay();
  updatePhaseButtons();
}

// Load state from storage
function loadState() {
  chrome.storage.local.get(['pomodoroState'], (result) => {
    if (result.pomodoroState) {
      Object.assign(state, result.pomodoroState);

      // If timer was running, calculate remaining time
      if (state.isRunning && state.lastUpdate) {
        const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
        state.timeRemaining = Math.max(0, state.timeRemaining - elapsed);

        if (state.timeRemaining > 0) {
          startTimer();
        } else {
          handlePhaseComplete();
        }
      }

      updateDisplay();
      updatePhaseButtons();
    }
  });
}

// Save state to storage
function saveState() {
  const stateToSave = {
    ...state,
    lastUpdate: Date.now()
  };
  delete stateToSave.timerInterval;
  chrome.storage.local.set({ pomodoroState: stateToSave });
}

// Setup event listeners
function setupEventListeners() {
  // Tab navigation
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Timer controls
  elements.startBtn.addEventListener('click', startTimer);
  elements.pauseBtn.addEventListener('click', pauseTimer);
  elements.resetBtn.addEventListener('click', resetTimer);

  // Phase selection buttons
  elements.phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => selectPhase(btn.dataset.phase, parseInt(btn.dataset.time)));
  });
}

// Switch tabs
function switchTab(tabId) {
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  elements.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabId}-tab`);
  });
}

// Select phase and time
function selectPhase(phase, time) {
  if (state.isRunning) {
    pauseTimer();
  }

  state.currentPhase = phase;
  state.selectedTimes[phase] = time;
  state.timeRemaining = time * 60;
  state.totalTime = time * 60;

  updateDisplay();
  updatePhaseButtons();
  saveState();
}

// Update phase button active states
function updatePhaseButtons() {
  elements.phaseBtns.forEach(btn => {
    const isActive = btn.dataset.phase === state.currentPhase &&
                     parseInt(btn.dataset.time) === state.selectedTimes[state.currentPhase];
    btn.classList.toggle('active', isActive);
  });
}

// Start timer
function startTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
  }

  state.isRunning = true;
  elements.startBtn.disabled = true;
  elements.pauseBtn.disabled = false;
  elements.phaseDisplay.classList.add('timer-running');

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateDisplay();
    saveState();

    if (state.timeRemaining <= 0) {
      handlePhaseComplete();
    }
  }, 1000);

  saveState();

  // Send message to background script
  chrome.runtime.sendMessage({
    action: 'timerStarted',
    phase: state.currentPhase,
    duration: state.totalTime
  });
}

// Pause timer
function pauseTimer() {
  state.isRunning = false;
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  elements.startBtn.disabled = false;
  elements.pauseBtn.disabled = true;
  elements.phaseDisplay.classList.remove('timer-running');

  saveState();
}

// Reset timer
function resetTimer() {
  pauseTimer();
  state.timeRemaining = state.selectedTimes[state.currentPhase] * 60;
  state.totalTime = state.timeRemaining;
  updateDisplay();
  saveState();
}

// Handle phase completion
function handlePhaseComplete() {
  pauseTimer();

  // Increment session count if focus phase completed
  if (state.currentPhase === 'focus') {
    state.sessionCount++;
    elements.sessionCount.textContent = state.sessionCount;
  }

  // Send notification
  chrome.runtime.sendMessage({
    action: 'phaseComplete',
    phase: state.currentPhase,
    sessionCount: state.sessionCount
  });

  // Auto-advance to next phase
  advanceToNextPhase();
}

// Advance to next phase
function advanceToNextPhase() {
  const phaseOrder = ['focus', 'retrieve', 'rest'];
  const currentIndex = phaseOrder.indexOf(state.currentPhase);
  const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

  state.currentPhase = nextPhase;
  state.timeRemaining = state.selectedTimes[nextPhase] * 60;
  state.totalTime = state.timeRemaining;

  updateDisplay();
  updatePhaseButtons();
  saveState();
}

// Update display
function updateDisplay() {
  const config = phaseConfig[state.currentPhase];

  // Update phase icon
  elements.phaseIcon.innerHTML = config.icon;
  elements.phaseIcon.className = `phase-icon ${config.iconClass}`;

  // Update phase name
  elements.phaseName.textContent = config.name;

  // Update timer display
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  elements.timerDisplay.textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update progress bar
  const progress = ((state.totalTime - state.timeRemaining) / state.totalTime) * 100;
  elements.progressBar.style.width = `${progress}%`;
  elements.progressBar.className = `progress-bar ${config.progressClass}`;

  // Update session count
  elements.sessionCount.textContent = state.sessionCount;

  // Update button states based on timer state
  elements.startBtn.disabled = state.isRunning;
  elements.pauseBtn.disabled = !state.isRunning;

  if (state.isRunning) {
    elements.phaseDisplay.classList.add('timer-running');
  } else {
    elements.phaseDisplay.classList.remove('timer-running');
  }
}

// Format time helper
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTimer') {
    state.timeRemaining = message.timeRemaining;
    updateDisplay();
  }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
