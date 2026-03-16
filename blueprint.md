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
   - Push notifications (using Browser Notification API).
   - Grouping messages by conversation on the Home screen.

3. **Social Networking**:
   - **Explore**: Search for users by name or username.
   - **User Profiles**: View other users' details and start chats.
   - **Reels**: Short-form video content feed.
   - **Posts**: Create and view social media posts (Images, Captions).
   - **Stories/Status**: Share temporary updates.

4. **Admin Features**:
   - **Admin Dashboard**: View total users, active posts, and reports.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4.
- **Routing**: React Router 7.
- **Backend/Database**: 
  - **Firebase Auth**: User authentication.
  - **Cloud Firestore**: Primary database for users, messages, and posts.
  - **Firebase Realtime Database**: Used for real-time presence or specific sync tasks.
  - **Express**: Node.js server for hosting and potential API extensions.
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
- `createdAt`: timestamp

### `messages` Collection
- `chatId`: string (sorted combination of two UIDs)
- `senderId`: string
- `receiverId`: string
- `text`: string
- `timestamp`: timestamp
- `isRead`: boolean

### `posts` Collection
- `authorId`: string
- `caption`: string
- `imageUrl`: string
- `likes`: array of UIDs
- `createdAt`: timestamp

## Design Principles
- **Mobile-First**: Centered layout optimized for mobile devices (max-width 450px).
- **Modern UI**: Clean zinc-based palette with sky-blue accents.
- **Performance**: Use of local storage for caching user data and optimized Firestore queries.
- **Accessibility**: High contrast text and intuitive navigation.
