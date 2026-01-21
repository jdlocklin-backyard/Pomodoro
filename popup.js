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
  autoStart: true,
  timerInterval: null
};

// Study statistics storage
let studyStats = {
  dailyMinutes: {}, // { 'YYYY-MM-DD': { total: 0, focus: 0, retrieve: 0, rest: 0 } }
  totalSessions: 0
};

// DOM Elements
const elements = {};

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
  cacheElements();
  loadState();
  loadStats();
  setupEventListeners();
  updateDisplay();
  updatePhaseButtons();
  updateCycleIndicator();
  renderHeatMap();
  updateStatsDisplay();
}

// Cache DOM elements
function cacheElements() {
  elements.tabBtns = document.querySelectorAll('.tab-btn');
  elements.tabContents = document.querySelectorAll('.tab-content');
  elements.phaseIcon = document.getElementById('phase-icon');
  elements.phaseName = document.getElementById('phase-name');
  elements.timerDisplay = document.getElementById('timer-display');
  elements.progressBar = document.getElementById('progress-bar');
  elements.startBtn = document.getElementById('start-btn');
  elements.pauseBtn = document.getElementById('pause-btn');
  elements.resetBtn = document.getElementById('reset-btn');
  elements.phaseBtns = document.querySelectorAll('.phase-btn');
  elements.sessionCount = document.getElementById('session-count');
  elements.phaseDisplay = document.querySelector('.phase-display');
  elements.autoStartToggle = document.getElementById('auto-start-toggle');
  elements.cycleSteps = document.querySelectorAll('.cycle-step');
  elements.todayMinutes = document.getElementById('today-minutes');
  elements.heatmapGrid = document.getElementById('heatmap-grid');
  elements.heatmapMonths = document.getElementById('heatmap-months');
  elements.totalMinutes = document.getElementById('total-minutes');
  elements.totalSessions = document.getElementById('total-sessions');
  elements.currentStreak = document.getElementById('current-streak');
  elements.focusBar = document.getElementById('focus-bar');
  elements.retrieveBar = document.getElementById('retrieve-bar');
  elements.restBar = document.getElementById('rest-bar');
  elements.focusTotal = document.getElementById('focus-total');
  elements.retrieveTotal = document.getElementById('retrieve-total');
  elements.restTotal = document.getElementById('rest-total');
  elements.clearStatsBtn = document.getElementById('clear-stats-btn');
}

// Load state from storage
function loadState() {
  chrome.storage.local.get(['pomodoroState'], (result) => {
    if (result.pomodoroState) {
      Object.assign(state, result.pomodoroState);

      // Restore auto-start toggle
      if (elements.autoStartToggle) {
        elements.autoStartToggle.checked = state.autoStart !== false;
      }

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
      updateCycleIndicator();
    }
  });
}

// Load study statistics
function loadStats() {
  chrome.storage.local.get(['studyStats'], (result) => {
    if (result.studyStats) {
      studyStats = result.studyStats;
    }
    updateStatsDisplay();
    renderHeatMap();
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

// Save study statistics
function saveStats() {
  chrome.storage.local.set({ studyStats });
}

// Get today's date string
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Record study time
function recordStudyTime(phase, minutes) {
  const today = getTodayString();

  if (!studyStats.dailyMinutes[today]) {
    studyStats.dailyMinutes[today] = { total: 0, focus: 0, retrieve: 0, rest: 0 };
  }

  studyStats.dailyMinutes[today][phase] += minutes;
  studyStats.dailyMinutes[today].total += minutes;

  saveStats();
  updateStatsDisplay();

  // Update today's minutes display
  if (elements.todayMinutes) {
    elements.todayMinutes.textContent = Math.round(studyStats.dailyMinutes[today].total);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Tab navigation
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      if (btn.dataset.tab === 'stats') {
        renderHeatMap();
        updateStatsDisplay();
      }
    });
  });

  // Timer controls
  elements.startBtn.addEventListener('click', startTimer);
  elements.pauseBtn.addEventListener('click', pauseTimer);
  elements.resetBtn.addEventListener('click', resetTimer);

  // Phase selection buttons
  elements.phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => selectPhase(btn.dataset.phase, parseInt(btn.dataset.time)));
  });

  // Auto-start toggle
  if (elements.autoStartToggle) {
    elements.autoStartToggle.addEventListener('change', (e) => {
      state.autoStart = e.target.checked;
      saveState();
    });
  }

  // Clear stats button
  if (elements.clearStatsBtn) {
    elements.clearStatsBtn.addEventListener('click', clearAllStats);
  }
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
  updateCycleIndicator();
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

// Update cycle indicator
function updateCycleIndicator() {
  elements.cycleSteps.forEach(step => {
    const isActive = step.dataset.phase === state.currentPhase;
    step.classList.toggle('active', isActive);
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

  // Track start time for this phase
  state.phaseStartTime = Date.now();

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

  // Calculate minutes spent in this phase
  const minutesSpent = state.selectedTimes[state.currentPhase];

  // Record the study time
  recordStudyTime(state.currentPhase, minutesSpent);

  // Increment session count if focus phase completed
  if (state.currentPhase === 'focus') {
    state.sessionCount++;
    studyStats.totalSessions++;
    saveStats();
    elements.sessionCount.textContent = state.sessionCount;
  }

  // Send notification
  chrome.runtime.sendMessage({
    action: 'phaseComplete',
    phase: state.currentPhase,
    sessionCount: state.sessionCount,
    minutesSpent: minutesSpent
  });

  // Auto-advance to next phase
  advanceToNextPhase();

  // Auto-start next phase if enabled
  if (state.autoStart) {
    setTimeout(() => {
      startTimer();
    }, 1000); // Small delay before auto-starting
  }
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
  updateCycleIndicator();
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

  // Update today's minutes
  const today = getTodayString();
  const todayStats = studyStats.dailyMinutes[today];
  if (elements.todayMinutes && todayStats) {
    elements.todayMinutes.textContent = Math.round(todayStats.total);
  }

  // Update button states based on timer state
  elements.startBtn.disabled = state.isRunning;
  elements.pauseBtn.disabled = !state.isRunning;

  if (state.isRunning) {
    elements.phaseDisplay.classList.add('timer-running');
  } else {
    elements.phaseDisplay.classList.remove('timer-running');
  }
}

// Render Heat Map
function renderHeatMap() {
  if (!elements.heatmapGrid) return;

  elements.heatmapGrid.innerHTML = '';

  // Generate last 16 weeks (112 days) of data
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 111);

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  // Get max minutes for scaling
  const allMinutes = Object.values(studyStats.dailyMinutes).map(d => d.total);
  const maxMinutes = Math.max(...allMinutes, 1);

  // Render months header
  renderMonthsHeader(startDate);

  // Create cells
  const currentDate = new Date(startDate);
  const endDate = new Date(today);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayData = studyStats.dailyMinutes[dateStr];
    const minutes = dayData ? dayData.total : 0;

    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';

    // Calculate level (0-4)
    let level = 0;
    if (minutes > 0) {
      const ratio = minutes / maxMinutes;
      if (ratio >= 0.75) level = 4;
      else if (ratio >= 0.5) level = 3;
      else if (ratio >= 0.25) level = 2;
      else level = 1;
    }

    if (level > 0) {
      cell.classList.add(`level-${level}`);
    }

    // Add tooltip
    const dateFormatted = currentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    cell.title = `${dateFormatted}: ${Math.round(minutes)} minutes`;

    elements.heatmapGrid.appendChild(cell);

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Render months header
function renderMonthsHeader(startDate) {
  if (!elements.heatmapMonths) return;

  elements.heatmapMonths.innerHTML = '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date(startDate);
  const today = new Date();
  let lastMonth = -1;

  // Create month spans
  const monthPositions = [];

  while (currentDate <= today) {
    const month = currentDate.getMonth();
    if (month !== lastMonth) {
      monthPositions.push({
        month: months[month],
        week: Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000))
      });
      lastMonth = month;
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }

  monthPositions.forEach((pos, index) => {
    const span = document.createElement('span');
    span.textContent = pos.month;
    span.style.marginLeft = index === 0 ? '0' : '10px';
    elements.heatmapMonths.appendChild(span);
  });
}

// Update stats display
function updateStatsDisplay() {
  // Calculate totals
  let totalMinutes = 0;
  let focusTotal = 0;
  let retrieveTotal = 0;
  let restTotal = 0;

  // Last 7 days for breakdown
  const last7Days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  // Calculate all-time totals and 7-day breakdown
  Object.entries(studyStats.dailyMinutes).forEach(([date, data]) => {
    totalMinutes += data.total;

    if (last7Days.includes(date)) {
      focusTotal += data.focus || 0;
      retrieveTotal += data.retrieve || 0;
      restTotal += data.rest || 0;
    }
  });

  // Calculate streak
  const streak = calculateStreak();

  // Update summary cards
  if (elements.totalMinutes) {
    elements.totalMinutes.textContent = Math.round(totalMinutes);
  }
  if (elements.totalSessions) {
    elements.totalSessions.textContent = studyStats.totalSessions || 0;
  }
  if (elements.currentStreak) {
    elements.currentStreak.textContent = streak;
  }

  // Update breakdown bars
  const maxPhaseMinutes = Math.max(focusTotal, retrieveTotal, restTotal, 1);

  if (elements.focusBar) {
    elements.focusBar.style.width = `${(focusTotal / maxPhaseMinutes) * 100}%`;
  }
  if (elements.retrieveBar) {
    elements.retrieveBar.style.width = `${(retrieveTotal / maxPhaseMinutes) * 100}%`;
  }
  if (elements.restBar) {
    elements.restBar.style.width = `${(restTotal / maxPhaseMinutes) * 100}%`;
  }

  if (elements.focusTotal) {
    elements.focusTotal.textContent = `${Math.round(focusTotal)} min`;
  }
  if (elements.retrieveTotal) {
    elements.retrieveTotal.textContent = `${Math.round(retrieveTotal)} min`;
  }
  if (elements.restTotal) {
    elements.restTotal.textContent = `${Math.round(restTotal)} min`;
  }

  // Update today's minutes on timer tab
  const todayStr = getTodayString();
  const todayData = studyStats.dailyMinutes[todayStr];
  if (elements.todayMinutes) {
    elements.todayMinutes.textContent = todayData ? Math.round(todayData.total) : 0;
  }
}

// Calculate current streak
function calculateStreak() {
  const dates = Object.keys(studyStats.dailyMinutes).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];

    if (studyStats.dailyMinutes[checkDateStr] && studyStats.dailyMinutes[checkDateStr].total > 0) {
      streak++;
    } else if (i > 0) {
      // Allow for missing today if checking from yesterday
      break;
    }
  }

  return streak;
}

// Clear all stats
function clearAllStats() {
  if (confirm('Are you sure you want to clear all study data? This cannot be undone.')) {
    studyStats = {
      dailyMinutes: {},
      totalSessions: 0
    };
    state.sessionCount = 0;
    saveStats();
    saveState();
    updateStatsDisplay();
    renderHeatMap();
    elements.sessionCount.textContent = 0;
    elements.todayMinutes.textContent = 0;
  }
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
