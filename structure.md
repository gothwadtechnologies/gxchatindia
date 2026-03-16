# GxChat India - Project Structure

## Root Directory
- `.env.example`: Template for environment variables.
- `.gitignore`: Files and directories to be ignored by Git.
- `index.html`: Main HTML entry point.
- `metadata.json`: App metadata (name, description, permissions).
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `vite.config.ts`: Vite configuration with Tailwind CSS and React plugins.
- `structure.md`: Project structure documentation.
- `blueprint.md`: App functionality and description documentation.

## /server Directory
- `firebase.ts`: Firebase configuration and service initialization (Auth, Firestore, RTDB).
- `server.ts`: Express server with Vite middleware for development and static serving for production.

## /tabs Directory
- `ChatsTab.tsx`: Displays a list of recent conversations/chats.
- `StatusTab.tsx`: View and post status updates.
- `SearchTab.tsx`: Search for users and discover new people.
- `CallsTab.tsx`: Call history and calling interface.
- `ProfileTab.tsx`: Current user's profile with stats and privacy settings.

## /documents Directory
- `privacypolicy.html`: Detailed privacy policy for GxChat India.
- `termsandconditions.html`: Detailed terms and conditions for GxChat India.

## /storage Directory
- Used for storing application-related data (e.g., local database files, uploads).

## /assets Directory
- Used for storing static assets like images, logos, and icons.

## /src Directory
- `App.tsx`: Main application component with routing and authentication guard logic.
- `index.css`: Global styles, Tailwind CSS imports, and custom theme definitions.
- `main.tsx`: React entry point.

## /admin Directory
- `AdminDashboard.tsx`: Dashboard for administrators to view app statistics.

## /components Directory
- `BottomNav.tsx`: Bottom navigation bar for mobile layout.
- `TopNav.tsx`: Top navigation bar with logo and quick actions.
- `PostCard.tsx`: Component to display individual social media posts.
- `StoryBar.tsx`: Component for displaying user stories/status updates.

## /screen Directory
- `ChatScreen.tsx`: Real-time messaging interface between two users.
- `UserProfileScreen.tsx`: View other users' profiles.
- `ReelsScreen.tsx`: Vertical short-video feed.
- `CreatePostScreen.tsx`: Interface for creating new posts.
- `EditProfileScreen.tsx`: Form to update user profile information.
- `NotificationsScreen.tsx`: List of user notifications.
- `SettingsScreen.tsx`: App settings and configurations.
- `MessagesListScreen.tsx`: Alternative list view for messages.

## /user Directory
- `LoginScreen.tsx`: User login interface.
- `SignupScreen.tsx`: User registration interface.
- `VerifyEmailScreen.tsx`: Email verification prompt.
- `CompleteProfileScreen.tsx`: Initial profile setup after registration.
