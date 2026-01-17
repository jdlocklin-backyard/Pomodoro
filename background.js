// Background service worker for managing timers and notifications
let timerState = {
  isRunning: false,
  isPaused: false,
  endTime: null,
  duration: 0,
  mode: 'focus',
  breakType: 'diffuse'
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.duration, message.mode, message.breakType);
      break;
    case 'pauseTimer':
      pauseTimer();
      break;
    case 'resumeTimer':
      resumeTimer();
      break;
    case 'resetTimer':
      resetTimer();
      break;
    case 'timerComplete':
      handleTimerComplete(message.mode);
      break;
  }
});

function startTimer(duration, mode, breakType) {
  timerState.isRunning = true;
  timerState.isPaused = false;
  timerState.duration = duration;
  timerState.mode = mode;
  timerState.breakType = breakType;
  timerState.endTime = Date.now() + (duration * 1000);
  
  // Create an alarm
  chrome.alarms.create('pomodoroTimer', {
    when: timerState.endTime
  });
}

function pauseTimer() {
  if (timerState.isRunning && !timerState.isPaused) {
    timerState.isPaused = true;
    const remainingTime = Math.max(0, Math.floor((timerState.endTime - Date.now()) / 1000));
    timerState.duration = remainingTime;
    chrome.alarms.clear('pomodoroTimer');
  }
}

function resumeTimer() {
  if (timerState.isPaused) {
    timerState.isPaused = false;
    timerState.endTime = Date.now() + (timerState.duration * 1000);
    chrome.alarms.create('pomodoroTimer', {
      when: timerState.endTime
    });
  }
}

function resetTimer() {
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.endTime = null;
  chrome.alarms.clear('pomodoroTimer');
}

function handleTimerComplete(nextMode) {
  timerState.isRunning = false;
  timerState.mode = nextMode;
}

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    showNotification();
    timerState.isRunning = false;
  }
});

function showNotification() {
  const notificationOptions = {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Pomodoro Timer',
    message: '',
    priority: 2
  };

  if (timerState.mode === 'focus') {
    notificationOptions.title = '🎉 Focus Session Complete!';
    if (timerState.breakType === 'diffuse') {
      notificationOptions.message = 'Great work! Time for a diffuse mode break. Step away and let your mind wander.';
    } else {
      notificationOptions.message = 'Great work! Time for restful wakefulness. Sit quietly and let your brain rest.';
    }
  } else {
    notificationOptions.title = '⏰ Break Time Over!';
    notificationOptions.message = 'Feeling refreshed? Ready to start another focus session?';
  }

  chrome.notifications.create('pomodoroNotification', notificationOptions);
  
  // Play a sound (notification sound is handled by Chrome)
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'pomodoroNotification') {
    // Clear the notification when clicked
    chrome.notifications.clear(notificationId);
  }
});

// Initialize
chrome.runtime.onInstalled.addListener(() => {
  console.log('Pomodoro Timer Extension installed');
});
