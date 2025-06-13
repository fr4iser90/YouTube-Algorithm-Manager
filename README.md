# YouTube Content Filter

## ⚠️ Disclaimer ⚠️

This browser extension helps users filter and manage their YouTube content by detecting clickbait and filtering unwanted content. It is designed to enhance your YouTube experience by giving you more control over what content you see.

**RISK OF ACCOUNT BAN:** The use of this extension could be detected by YouTube as bot activity, which may result in a temporary or permanent ban of your YouTube account.

**USE AT YOUR OWN RISK:** You are solely responsible for any consequences that may arise from using this extension, including the loss of your YouTube account. The author of this extension is not liable for any damages or losses.

---

## 📋 Overview
This project is a browser extension that helps users filter YouTube content based on custom keyword lists and clickbait detection. It allows users to create and manage presets for different filtering configurations.

## 🏗️ Architecture
The application is built using a modern React-based architecture with the following key components:

- **Frontend**: React with TypeScript, using Vite as the build tool.
- **State Management**: Local state management with React hooks and localStorage for persistence.
- **Browser Extension**: A Chrome extension that filters YouTube content in real-time.
- **Communication**: Cross-domain communication between the web app and the extension using localStorage and Chrome Messages.

## 🛠️ Techstack
- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Framer Motion (for animations)
  - Lucide React (for icons)
- **Browser Extension**:
  - Chrome Extension API
  - Content Scripts
  - Background Scripts
- **Storage**:
  - localStorage (for preset data)
  - sessionStorage (for temporary data)

## 📁 Project Structure
- **`src/`**: Contains the main application code.
  - **`components/`**: React components for the UI.
  - **`hooks/`**: Custom React hooks for state management.
  - **`types/`**: TypeScript type definitions.
  - **`data/`**: Static data like preset templates.
- **`extension/`**: Contains the browser extension code.
  - **`content/`**: Content scripts that run on YouTube.
  - **`background/`**: Background scripts for the extension.
  - **`popup/`**: UI for the extension popup.

## 🔄 Key Features
- **Preset Management**: Create, edit, and manage custom presets for content filtering.
- **Keyword Filtering**: Filter videos based on custom keyword lists.
- **Clickbait Detection**: Automatically detect and filter clickbait content.
- **Channel Blocking**: Block specific channels from appearing in your feed.
- **Real-time Filtering**: Filter content as you browse YouTube.

## 🚀 Getting Started
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd YouTube-Content-Filter
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Load the extension**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder.

## 📝 Documentation
- **Architecture**: The application uses a React-based frontend with a Chrome extension for real-time content filtering.
- **Techstack**: React, TypeScript, Vite, Framer Motion, Lucide React, Chrome Extension API.
- **Key Components**:
  - **`ContentFilter`**: Manages content filtering logic.
  - **`PresetManager`**: Handles saving, loading, and managing keyword presets.
  - **`ClickbaitDetector`**: Detects clickbait patterns in video titles.
  - **`BrowserController`**: Controls browser settings for the extension.

## 🔧 Development
- **Frontend**: The frontend is built with React and TypeScript, using Vite for fast development and building.
- **Extension**: The extension is built using the Chrome Extension API, with content scripts for YouTube interaction.

## 📊 Future Enhancements
- Add more advanced clickbait detection patterns.
- Improve keyword matching algorithms.
- Add support for regular expressions in keyword lists.
- Enhance the UI/UX for better user experience.

## 📋 Development Plan

### Phase 1: Core Structure (Days 1-2)
- [ ] Remove algorithm training and profile management
- [ ] Set up basic extension structure
- [ ] Create content script for YouTube page interaction
- [ ] Implement basic keyword filtering logic

### Phase 2: Preset System (Days 3-4)
- [ ] Redesign preset system for keyword lists
- [ ] Create preset management UI
- [ ] Implement preset storage in localStorage
- [ ] Add preset import/export functionality

### Phase 3: Content Filtering (Days 5-7)
- [ ] Implement keyword matching system
- [ ] Add clickbait detection patterns
- [ ] Create channel blocking functionality
- [ ] Add real-time content filtering

### Phase 4: UI/UX (Days 8-9)
- [ ] Design and implement extension popup
- [ ] Create settings interface
- [ ] Add toggle controls for features
- [ ] Implement visual feedback for filtered content

### Phase 5: Testing & Polish (Days 10-12)
- [ ] Test on different YouTube pages
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Final UI polish
- [ ] Documentation updates

### Key Components to Implement:
1. **ContentFilter**
   - Keyword matching
   - Clickbait detection
   - Channel blocking

2. **PresetManager**
   - Keyword list management
   - Preset storage
   - Import/Export

3. **YouTubeInterface**
   - Content script for YouTube
   - Real-time filtering
   - Visual feedback

4. **Settings**
   - Feature toggles
   - Keyword management
   - Channel blocking list

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.
