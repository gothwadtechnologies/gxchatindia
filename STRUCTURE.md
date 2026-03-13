# GX Chat India - Project Architecture
**Founder:** Pawan Gothwad (Gothwad Technologies)
**Tech Stack:** Flutter, Firebase, TypeScript (Cloud Functions)

---

## Folder Structure

gx_chat_india/
├── lib/
│   ├── core/              # Constants, Themes, & Common Utils
│   │   ├── constants/        # App colors, Strings, API keys
│   │   └── theme/            # Light/Dark mode logic
│   │
│   ├── data/              # Data Layer (The "Brain")
│   │   ├── models/           # User, Message, Group models
│   │   ├── providers/        # Firebase/API direct calls
│   │   └── repositories/     # Logic to handle data flow
│   │
│   ├── presentation/      # UI Layer (The "Face")
│   │  ├── screens/          # Login, Chat, Profile, Home
│   │  └── widgets/          # Custom Buttons, Chat Bubbles
│   │
│   ├── services/          # App Services
│   │  ├── auth_service.dart # Firebase Auth logic
│   │  ├── chat_service.dart # Firestore real-time messaging
│   │  └── push_notif.dart   # Firebase Cloud Messaging
│   │
│   └── main.dart          # Entry point of the app
│
├── firebase/              # Firebase Studio & Rules
│  ├── firestore.rules       # Security rules for DB
│  └── storage.rules         # Media upload rules
│
├── assets/                # Images, Fonts, & Icons
├── pubspec.yaml           # Flutter Dependencies
└── README.md              # Project Documentation