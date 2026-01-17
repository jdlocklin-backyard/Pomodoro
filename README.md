# Pomodoro Focus Timer - Chrome Extension

A Chromium-based browser extension implementing the Pomodoro Technique with additional support for **Diffuse Mode** (retrieval practice) and **Restful Wakefulness** phases for optimal learning and productivity.

## Features

- **Focus Time**: Configurable sessions of 10, 15, or 25 minutes for concentrated work
- **Retrieve (Diffuse Mode)**: 3-5 minute periods for active recall and mental consolidation
- **Restful Wakefulness**: 3-minute breaks for complete mental rest
- **Session Tracking**: Keeps count of completed focus sessions
- **Desktop Notifications**: Alerts when each phase completes
- **Persistent Timer**: Timer continues even when popup is closed
- **Two-Tab Interface**:
  - Timer tab for controlling your Pomodoro sessions
  - Information tab explaining the science behind each phase

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download or Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Pomodoro
   ```

2. **Open Chrome/Chromium Browser**
   - Navigate to `chrome://extensions/`
   - Or go to Menu (three dots) > More Tools > Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `Pomodoro` folder containing `manifest.json`
   - Click "Select Folder"

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the toolbar
   - Find "Pomodoro Focus Timer" and click the pin icon

### Method 2: For Other Chromium-Based Browsers

This extension works with any Chromium-based browser:
- **Microsoft Edge**: Navigate to `edge://extensions/`
- **Brave**: Navigate to `brave://extensions/`
- **Opera**: Navigate to `opera://extensions/`
- **Vivaldi**: Navigate to `vivaldi://extensions/`

Follow the same steps as above for your specific browser.

## Usage

### Timer Tab

1. **Select a Phase**: Click on any phase button to set up your timer
   - **Focus Time**: 10, 15, or 25 minutes
   - **Retrieve**: 3, 4, or 5 minutes
   - **Restful Wakefulness**: 3 minutes

2. **Control the Timer**:
   - **Start**: Begin the countdown
   - **Pause**: Temporarily stop the timer
   - **Reset**: Reset to the beginning of the current phase

3. **Automatic Phase Progression**: When a phase completes, the timer automatically advances to the next phase in the cycle: Focus > Retrieve > Rest > Focus...

### Learn More Tab

Read about the science behind each phase:
- Why focused attention builds neural pathways
- How diffuse mode enhances learning through active recall
- The benefits of restful wakefulness for memory consolidation

## The Science

### Focus Mode (Focused Attention)
During focus time, your brain creates tight, localized neural connections. This is when you actively concentrate on learning new concepts or solving problems.

### Retrieve / Diffuse Mode
After focused work, your brain benefits from switching to a diffuse thinking mode. This phase encourages:
- Active recall of what you just learned
- Subconscious processing of information
- Making unexpected connections between concepts

### Restful Wakefulness
Brief periods of mental rest (while staying awake) help:
- Consolidate memories
- Reduce mental fatigue
- Prepare your brain for the next focus session

## File Structure

```
Pomodoro/
├── manifest.json      # Extension configuration
├── popup.html         # Main popup interface
├── popup.css          # Styling
├── popup.js           # Timer logic and UI interactions
├── background.js      # Service worker for notifications
├── icons/
│   ├── icon16.png     # Toolbar icon (16x16)
│   ├── icon48.png     # Extension management icon (48x48)
│   └── icon128.png    # Chrome Web Store icon (128x128)
└── README.md          # This file
```

## Permissions

The extension requests the following permissions:
- **storage**: To save timer state and session count
- **notifications**: To alert you when phases complete
- **alarms**: To track timer progress when popup is closed

## Troubleshooting

### Timer Not Persisting
- Ensure you've granted all requested permissions
- Check that Chrome's notification settings allow the extension

### Notifications Not Appearing
- Go to Chrome Settings > Privacy and Security > Site Settings > Notifications
- Ensure notifications are allowed for extensions

### Extension Not Loading
- Verify all files are present in the extension folder
- Check the browser console for errors (`chrome://extensions/` > Details > Errors)

## Contributing

Feel free to submit issues and pull requests for improvements.

## License

MIT License - Feel free to use and modify for your own purposes.
