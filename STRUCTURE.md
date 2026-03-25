# GxChat India Project Structure

GxChat India is a full-stack real-time messaging and social media application built with a modern tech stack.

## 📁 Directory Structure

### 🏗 Core Application (`/src`)
- `App.tsx`: Main entry point, routing logic, authentication guards, and global listeners (CallListener, NotificationHandler).
- `main.tsx`: React DOM rendering.
- `index.css`: Global styles and Tailwind CSS configuration.
- `types.ts`: TypeScript interfaces and types.
- `constants.ts`: Global constants and configuration.
- `/context`: React Context providers (e.g., `ThemeContext.tsx`).
- `/services`: Business logic layer:
  - `CacheService.ts`: Local storage caching for user data and messages.
  - `LockService.ts`: App lock state management.
- `/utils`: Helper functions (e.g., `dateUtils.ts`).

### 📱 Screens (`/screen`)
- `ChatScreen.tsx`: Rich chat interface with typing indicators, replies, editing, and message actions.
- `MessagesListScreen.tsx`: List of active conversations.
- `UserProfileScreen.tsx`: Detailed user profiles with follow/message actions.
- `ReelsScreen.tsx`: Short-form video feed.
- `CreatePostScreen.tsx`: UI for creating new image posts.
- `NotificationsScreen.tsx`: Activity and message notifications.
- `SettingsScreen.tsx`: Main settings hub.
- `GlobalLockScreen.tsx`: App-wide security lock interface.
- `CallScreen.tsx`: Audio/Video calling interface.
- `FollowListScreen.tsx`: Followers and Following lists.
- `PrivacySettingsScreen.tsx`, `AppPreferencesScreen.tsx`, `AccountSettingsScreen.tsx`: Sub-settings screens.

### 📑 Navigation Tabs (`/tabs`)
- `ChatsTab.tsx`: Main chat list.
- `SearchTab.tsx`: User discovery and explore feed.
- `StatusTab.tsx`: Stories and temporary updates.
- `CallsTab.tsx`: Call history.
- `ProfileTab.tsx`: Current user's profile view.
- `CameraTab.tsx`: Camera interface for stories/posts.

### 🧩 Components (`/components`)
- `TopNav.tsx` & `BottomNav.tsx`: Main navigation bars.
- `PostCard.tsx`: Reusable social media post component.
- `StoryBar.tsx`: Horizontal list of user stories.
- `/src/components/ChatUIComponents.tsx`: Specialized components for the chat interface.
- `/src/components/NotificationHandler.tsx`: Logic for handling push notifications.

### 🔐 User & Auth (`/user`)
- `LoginScreen.tsx` & `SignupScreen.tsx`: Authentication flows.
- `VerifyEmailScreen.tsx`: Email verification interface.
- `CompleteProfileScreen.tsx`: Onboarding for new users.

### ⚙️ Backend & Admin (`/server` & `/admin`)
- `/server/server.ts`: Express server with Vite middleware and notification API.
- `/server/firebase.ts`: Firebase SDK initialization (Auth, Firestore, RTDB).
- `/server/admin.ts`: Firebase Admin SDK for server-side tasks.
- `/admin/AdminDashboard.tsx`: Metrics and management dashboard.

## ✨ Key Features

- **Real-time Messaging**: Powered by Firestore `onSnapshot` for instant updates.
- **Presence System**: Real-time online/offline status via Firebase Realtime Database.
- **Typing Indicators**: Live "Typing..." feedback in chat.
- **Message Actions**: Reply, Edit, Delete (Hard Delete), and Forwarding.
- **App Security**: Global security PIN/Password protection with `LockService`.
- **Social Feed**: Image posts with likes and captions.
- **Short-form Video**: Reels feed for video content.
- **Push Notifications**: FCM-based notifications via a custom Express API.
- **Theming**: Dynamic light/dark mode support.
- **Caching**: Optimized performance using `CacheService` for local data persistence.
