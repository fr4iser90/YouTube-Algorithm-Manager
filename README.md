# YouTube Algorithm Manager

## 📋 Overview
This project is a web application designed to train and manage YouTube's recommendation algorithm using a browser extension. It allows users to create custom presets, save sessions, and interact with YouTube in real-time to influence their recommendations.

## 🏗️ Architecture
The application is built using a modern React-based architecture with the following key components:

- **Frontend**: React with TypeScript, using Vite as the build tool.
- **State Management**: Local state management with React hooks and localStorage for persistence.
- **Browser Extension**: A Chrome extension that interacts with YouTube to perform real-time training.
- **Communication**: Cross-domain communication between the web app and the extension using localStorage, BroadcastChannel, and Chrome Messages.

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
  - localStorage (for session and preset data)
  - sessionStorage (for temporary data)
- **Communication**:
  - BroadcastChannel
  - Chrome Messages
  - localStorage

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
- **Preset Management**: Create, edit, and manage custom presets for YouTube algorithm training.
- **Session Management**: Save and load sessions to quickly switch between different training configurations.
- **Real-time Training**: Use the browser extension to interact with YouTube and train the algorithm in real-time.
- **Cross-domain Communication**: Seamless communication between the web app and the extension.

## 🚀 Getting Started
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd YouTube-Algorithm-Manager
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
- **Architecture**: The application uses a React-based frontend with a Chrome extension for real-time interaction with YouTube.
- **Techstack**: React, TypeScript, Vite, Framer Motion, Lucide React, Chrome Extension API.
- **Key Components**:
  - **`ExtensionBridge`**: Manages communication between the web app and the extension.
  - **`SessionLoader`**: Handles saving, loading, and managing sessions.
  - **`PresetCard`**: Displays and manages custom presets.
  - **`BrowserController`**: Controls browser settings for the extension.

## 🔧 Development
- **Frontend**: The frontend is built with React and TypeScript, using Vite for fast development and building.
- **Extension**: The extension is built using the Chrome Extension API, with content scripts for YouTube interaction and background scripts for persistent tasks.

## 📊 Future Enhancements
- Add more advanced analytics for algorithm training.
- Improve cross-browser compatibility.
- Enhance the UI/UX for better user experience.

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details. 