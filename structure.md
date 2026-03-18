# GxChat India Project Structure

This project is a full-stack real-time messaging application built with React, Vite, Tailwind CSS, and Firebase.

## Directory Structure

- `/src`: Main React application source code.
  - `/src/App.tsx`: Main application entry point with routing and global state.
  - `/src/components`: Reusable UI components.
  - `/src/context`: React context providers (e.g., ThemeContext).
  - `/src/services`: Service layer for business logic (e.g., LockService).
- `/screen`: Application screens/pages.
  - `ChatScreen.tsx`: Real-time chat interface with typing indicators, replies, and message actions.
  - `MessagesListScreen.tsx`: List of active conversations.
  - `SettingsScreen.tsx`: User settings and preferences.
  - `GlobalLockScreen.tsx`: App-wide security lock interface.
- `/tabs`: Main navigation tabs (Chats, Status, Calls, Profile).
- `/user`: Authentication screens (Login, Signup, Profile Completion).
- `/server`: Firebase configuration and backend-related logic.
- `/admin`: Admin dashboard for application management.
- `/public`: Static assets served by the application.
- `/assets`: Images and other media assets.

## Key Features

- **Real-time Messaging**: Powered by Firestore `onSnapshot`.
- **Typing Indicators**: Live feedback when the other user is typing.
- **Message Actions**: Reply, Edit, Delete (Hard Delete), and Forward.
- **App Lock**: Global security PIN/Password protection.
- **Splash Screen**: Branded 2-second loading experience.
- **Responsive Design**: Mobile-first centered layout for all devices.
- **Theming**: Support for custom themes and preferences.
