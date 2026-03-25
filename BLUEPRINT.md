# GxChat India - App Blueprint

## Overview
**GxChat India** is a comprehensive social media application designed for the Indian market. It combines features of popular platforms like Instagram and WhatsApp, offering real-time messaging, social networking, and media sharing in a mobile-first, centered layout.

## Core Features
1. **Authentication & User Management**:
   - Secure Login and Signup using Firebase Auth.
   - Email verification flow.
   - Profile completion for new users (Username, Full Name, Bio).
   - Profile editing including photo updates.
   - Privacy controls: Hide profile from search, hide profile photo.

2. **Real-time Messaging**:
   - One-on-one private chats.
   - Real-time updates using Firestore `onSnapshot`.
   - Read receipts (blue ticks).
   - Typing indicators (Live feedback).
   - Message actions: Reply, Edit, Hard Delete.
   - Push notifications (using FCM via Express API).

3. **Social Networking**:
   - **Explore**: Search for users by name or username.
   - **User Profiles**: View other users' details, follow/unfollow, and start chats.
   - **Reels**: Short-form video content feed.
   - **Posts**: Create and view social media posts (Images, Captions, Likes).
   - **Stories/Status**: Share temporary updates.

4. **Security & Performance**:
   - **App Lock**: Global PIN/Password protection.
   - **Caching**: Local storage caching for user data and messages to reduce Firestore reads.
   - **Presence**: Real-time online/offline status tracking.

5. **Admin Features**:
   - **Admin Dashboard**: View total users, active posts, and reports.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4.
- **Routing**: React Router 7.
- **Backend/Database**: 
  - **Firebase Auth**: User authentication.
  - **Cloud Firestore**: Primary database for users, messages, and posts.
  - **Firebase Realtime Database**: Presence tracking.
  - **Express**: Node.js server for FCM notifications and static hosting.
- **Icons**: Lucide React.
- **Animations**: Motion (Framer Motion).

## Data Models (Firestore)

### `users` Collection
- `uid`: string (Document ID)
- `username`: string (unique)
- `fullName`: string
- `email`: string
- `photoURL`: string
- `bio`: string
- `hideFromSearch`: boolean
- `hidePhoto`: boolean
- `isOnline`: boolean
- `lastSeen`: timestamp
- `fcmTokens`: array of strings
- `createdAt`: timestamp

### `messages` Collection
- `chatId`: string (sorted combination of two UIDs)
- `senderId`: string
- `receiverId`: string
- `text`: string
- `timestamp`: timestamp
- `isRead`: boolean
- `isEdited`: boolean
- `replyTo`: object { id, text, senderId }

### `posts` Collection
- `authorId`: string
- `caption`: string
- `imageUrl`: string
- `likes`: array of UIDs
- `createdAt`: timestamp

### `typing` Collection
- `chatId_userId`: document ID
- `isTyping`: boolean
- `timestamp`: timestamp

## Design Principles
- **Mobile-First**: Centered layout optimized for mobile devices (max-width 450px).
- **Modern UI**: Clean zinc-based palette with emerald and sky-blue accents.
- **Performance**: Heavy use of caching and optimized Firestore queries.
- **Accessibility**: High contrast text and intuitive navigation.
