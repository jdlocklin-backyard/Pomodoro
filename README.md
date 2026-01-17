# 🍅 Pomodoro Timer - Chrome Extension

A beautiful and functional Pomodoro Technique timer extension for Chromium-based browsers. This extension helps you maintain focus and productivity through structured work sessions and scientifically-backed break periods.

## Features

### Timer Options
- **Focus Sessions**: Choose from 10, 15, or 25-minute work periods
- **Diffuse Mode Breaks**: 3-5 minute breaks for creative thinking and memory consolidation
- **Restful Wakefulness**: 3-minute quiet rest periods for mental clarity and stress reduction

### Two-Tab Interface
1. **Timer Tab**: Intuitive controls to select durations, start/pause/reset timer, and monitor progress
2. **Information Tab**: Educational content explaining the importance of diffuse mode and restful wakefulness periods

### Additional Features
- Visual timer display with color-coded states (focus, break, paused)
- Browser notifications when sessions complete
- Clean, modern user interface with gradient design
- Persistent state across browser sessions

## Installation Instructions

### Method 1: Install from Chrome Web Store (Coming Soon)
_This extension will be available on the Chrome Web Store soon._

### Method 2: Install as Unpacked Extension (Developer Mode)

#### Step 1: Download the Extension
1. Download or clone this repository to your local machine
   ```bash
   git clone https://github.com/jdlocklin-backyard/Pomodoro.git
   ```
2. Or download as ZIP and extract to a folder

#### Step 2: Enable Developer Mode in Chrome
1. Open your Chromium-based browser (Chrome, Edge, Brave, etc.)
2. Navigate to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Toggle on **Developer mode** (usually in the top-right corner)

#### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to the folder containing the extension files
3. Select the folder and click **"Select"** or **"Open"**

#### Step 4: Verify Installation
1. You should see the Pomodoro Timer extension in your extensions list
2. A tomato icon 🍅 should appear in your browser toolbar
3. Click the icon to open the timer popup

### Troubleshooting

**Issue**: Extension doesn't appear after loading
- **Solution**: Make sure you selected the correct folder containing `manifest.json`

**Issue**: Icons not displaying
- **Solution**: Ensure the `icons/` folder exists with all required icon files

**Issue**: Notifications not working
- **Solution**: Check your browser's notification permissions in Settings > Privacy and Security > Site Settings > Notifications

## Usage Guide

### Starting a Focus Session
1. Click the Pomodoro Timer icon in your browser toolbar
2. Select your desired focus duration (10, 15, or 25 minutes)
3. Choose your preferred break type (Diffuse Mode or Restful Wakefulness)
4. Click **Start** to begin your focus session
5. Work with full concentration until the timer completes

### Taking Breaks
1. When your focus session completes, you'll receive a notification
2. The timer automatically switches to break mode
3. Click **Start** to begin your break
4. Use this time according to the break type:
   - **Diffuse Mode**: Walk, look outside, stretch, or do a completely different activity
   - **Restful Wakefulness**: Sit quietly, breathe naturally, let your mind rest

### Understanding the Science
1. Click the **Information** tab to learn about:
   - Why diffuse mode enhances learning and creativity
   - How restful wakefulness improves memory consolidation
   - Best practices for maximum productivity

## Files Structure

```
Pomodoro/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Styling for the popup
├── popup.js              # Timer logic and UI interactions
├── background.js         # Service worker for notifications and alarms
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Browser Compatibility

This extension works with all Chromium-based browsers:
- ✅ Google Chrome (version 88+)
- ✅ Microsoft Edge (version 88+)
- ✅ Brave Browser
- ✅ Opera
- ✅ Vivaldi
- ✅ Other Chromium-based browsers

## Permissions

This extension requires the following permissions:
- **notifications**: To alert you when timers complete
- **alarms**: To accurately track timer duration in the background
- **storage**: To remember your preferences (future feature)

## Tips for Effective Use

1. **Start Small**: If new to Pomodoro, begin with 10-15 minute sessions
2. **Honor Your Breaks**: Don't skip breaks - they're essential for productivity
3. **Alternate Break Types**: Try both diffuse mode and restful wakefulness
4. **Track Progress**: Keep a log of completed sessions to build momentum
5. **Eliminate Distractions**: Close unnecessary tabs and apps during focus sessions
6. **After 4 Sessions**: Take a longer break (15-30 minutes)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Credits

Developed as a productivity tool based on the Pomodoro Technique by Francesco Cirillo and neuroscience research on learning and memory consolidation.