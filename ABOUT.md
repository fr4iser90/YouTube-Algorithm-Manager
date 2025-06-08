## Inspiration
The project was inspired by a Reddit post about a project that manipulated Google history. This sparked the idea to create a tool that could influence YouTube's recommendation algorithm in a similar way, allowing users to train and manage their own algorithm preferences.

## What it does
The YouTube Algorithm Manager is a web application that allows users to create custom presets for training YouTube's recommendation algorithm. It includes a browser extension that interacts with YouTube in real-time, enabling users to influence their recommendations by performing actions like watching videos and performing searches.

## How we built it
- **Frontend**: Built with React and TypeScript, using Vite for fast development. Bolt.
- **Browser Extension**: Developed using the Chrome Extension API, with content scripts for YouTube interaction and background scripts for persistent tasks. Bolt.
- **Communication**: Implemented cross-domain communication between the web app and the extension using localStorage, BroadcastChannel, and Chrome Messages.

## Challenges we ran into
- Ensuring seamless communication between the web app and the browser extension.
- Managing state persistence across profiles and ensuring data integrity.
- Handling cross-domain restrictions and ensuring the extension works reliably on YouTube.

## Accomplishments that we're proud of
- Successfully creating a tool that allows users to influence their YouTube recommendations.
- Implementing a user-friendly interface for managing presets and profiles.
- Developing a robust communication system between the web app and the extension.

## What we learned
- Gained insights into how browser extensions interact with web applications.
- Learned about cross-domain communication techniques and their limitations.
- Improved understanding of state management in React applications.

## What's next for YouTube-Algorithm-Manager
- Add more advanced analytics for algorithm training.
- Improve cross-browser compatibility.
- Enhance the UI/UX for better user experience.
- Explore additional features for more personalized algorithm training.
