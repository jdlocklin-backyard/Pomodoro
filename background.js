// Background Service Worker for Pomodoro Timer

// Phase notification messages
const phaseMessages = {
  focus: {
    title: 'Focus Time Complete!',
    message: 'Great work! Time for retrieval practice. Try to recall what you just learned.',
    icon: 'icons/icon128.png'
  },
  retrieve: {
    title: 'Retrieval Complete!',
    message: 'Nice! Now take a moment for restful wakefulness. Close your eyes and relax.',
    icon: 'icons/icon128.png'
  },
  rest: {
    title: 'Rest Complete!',
    message: 'Refreshed and ready! Start your next focus session.',
    icon: 'icons/icon128.png'
  }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'timerStarted':
      handleTimerStarted(message);
      break;
    case 'phaseComplete':
      handlePhaseComplete(message);
      break;
    case 'getState':
      getState(sendResponse);
      return true; // Keep message channel open for async response
  }
});

// Handle timer started
function handleTimerStarted(message) {
  // Create an alarm for the timer
  chrome.alarms.create('pomodoroTimer', {
    delayInMinutes: message.duration / 60
  });
}

// Handle phase completion
function handlePhaseComplete(message) {
  const phaseInfo = phaseMessages[message.phase];

  // Clear any existing alarms
  chrome.alarms.clear('pomodoroTimer');

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: phaseInfo.icon,
    title: phaseInfo.title,
    message: phaseInfo.message,
    priority: 2,
    requireInteraction: true
  });

  // Play sound notification (using system notification sound)
  // Note: For custom sounds, you would need to use audio in popup or offscreen document
}

// Get current state
function getState(sendResponse) {
  chrome.storage.local.get(['pomodoroState'], (result) => {
    sendResponse(result.pomodoroState || null);
  });
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    // Timer completed via alarm (for when popup is closed)
    chrome.storage.local.get(['pomodoroState'], (result) => {
      if (result.pomodoroState) {
        const state = result.pomodoroState;
        const phaseInfo = phaseMessages[state.currentPhase];

        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: phaseInfo.icon,
          title: phaseInfo.title,
          message: phaseInfo.message,
          priority: 2,
          requireInteraction: true
        });

        // Update state
        advancePhase(state);
      }
    });
  }
});

// Advance to next phase (when popup is closed)
function advancePhase(currentState) {
  const phaseOrder = ['focus', 'retrieve', 'rest'];
  const currentIndex = phaseOrder.indexOf(currentState.currentPhase);
  const nextPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];

  const newState = {
    ...currentState,
    currentPhase: nextPhase,
    timeRemaining: currentState.selectedTimes[nextPhase] * 60,
    totalTime: currentState.selectedTimes[nextPhase] * 60,
    isRunning: false,
    sessionCount: currentState.currentPhase === 'focus'
      ? currentState.sessionCount + 1
      : currentState.sessionCount,
    lastUpdate: Date.now()
  };

  chrome.storage.local.set({ pomodoroState: newState });
}

// Handle notification click - open popup
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
  // Open the extension popup
  chrome.action.openPopup();
});

// Handle extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default state on first install
    const defaultState = {
      currentPhase: 'focus',
      selectedTimes: {
        focus: 25,
        retrieve: 3,
        rest: 3
      },
      timeRemaining: 25 * 60,
      totalTime: 25 * 60,
      isRunning: false,
      sessionCount: 0,
      lastUpdate: Date.now()
    };

    chrome.storage.local.set({ pomodoroState: defaultState });

    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Pomodoro Focus Timer Installed!',
      message: 'Click the extension icon to start your first focus session.',
      priority: 1
    });
  }
});

// Keep service worker alive during active timer
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.pomodoroState) {
    const newState = changes.pomodoroState.newValue;
    if (newState && newState.isRunning) {
      // Timer is running, ensure alarm is set
      const remainingMinutes = newState.timeRemaining / 60;
      chrome.alarms.create('pomodoroTimer', {
        delayInMinutes: remainingMinutes
      });
    } else {
      // Timer stopped, clear alarm
      chrome.alarms.clear('pomodoroTimer');
    }
  }
});
