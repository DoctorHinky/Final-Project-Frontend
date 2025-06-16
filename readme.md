
find . -type d -name "node_modules" -prune -o -type d -name ".git" -prune -o -print | sort > Projektstruktur.txt

# 📚 LearnToGrow - Interaktive Lernplattform

<div align="center">

![LearnToGrow Logo](./src/assets/images/Logo.png)

**Eine moderne, interaktive Lernplattform mit Community-Features und Quiz-System**

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Framework-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[🚀 Live Demo](https://your-demo-url.com) • [📖 Dokumentation](https://your-docs-url.com) • [🐛 Issues](https://github.com/your-repo/issues)

</div>

---

## 🎯 Projektübersicht

LearnToGrow ist eine innovative Lernplattform, die als Abschlussprojekt entwickelt wurde. Sie kombiniert moderne Webtechnologien mit durchdachtem UX/UI-Design, um eine optimale Lernerfahrung zu schaffen.

### 🌟 Kernfeatures

- **📝 Artikel-System** - Erstellen, bearbeiten und teilen von Lernartikeln
- **👥 Community** - Freundschaftssystem und soziale Interaktionen
- **📚 Persönliche Bibliothek** - Organisierte Sammlung von Lerninhalten
- **🔔 Smart Notifications** - Intelligente Benachrichtigungen für relevante Updates
- **⚙️ Admin-Panel** - Umfassendes Management-Interface
- **📱 Responsive Design** - Optimiert für alle Geräte
- **🎨 Dark/Light Mode** - Anpassbare Benutzeroberfläche

---

## 🏗️ Architektur & Technologie-Stack

### Frontend (Vue.js Ecosystem)
```typescript
├── 🎨 Vue 3 + Composition API    // Moderne Komponentenarchitektur
├── 🛡️ TypeScript               // Typsicherheit & bessere DX
├── 🧭 Vue Router 4             // Client-side Routing
├── 🎭 GSAP                     // Hochperformante Animationen
├── 💅 Sass/SCSS               // Erweiterte CSS-Features
├── 📡 Axios                   // HTTP Client
└── 🔐 JWT Decode              // Token-basierte Authentifizierung
```

### Backend (NestJS Ecosystem)
```typescript
├── 🏗️ NestJS Framework        // Modulare Backend-Architektur
├── 🗄️ Prisma ORM             // Type-safe Datenbankzugriff
├── 🔒 JWT Strategy            // Sichere Authentifizierung
├── 📧 Sendgrid + Interaktive Templates // E-Mail-Templates
├── ☁️ Cloudinary Integration  // Bild-Upload & -Verwaltung
├── 🐳 Docker Support          // Containerisierung
└── ✅ Jest Testing            // Unit & Integration Tests
```

### Datenbank & Services
```sql
├── 🐘 PostgreSQL              // Relationale Datenbank
├── 🔄 Prisma Migrations       // Schema-Versionierung
├── 📊 Optimierte Indizierung  // Performance-Optimierung
└── 🗑️ Soft Delete Pattern    // Datenintegrität
```

---

## 🚀 Schnellstart

### Voraussetzungen
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Docker** & **Docker Compose**
- **PostgreSQL** (oder Docker Alternative)

### 1️⃣ Repository klonen
```bash
git clone https://github.com/your-username/LearnToGrow.git
cd LearnToGrow
```

### 2️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Dependencies installieren
npm install

# Environment Variables konfigurieren
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Datenbank-Credentials

# Datenbank mit Docker starten
docker-compose up -d

# Prisma Setup
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# Backend starten
npm run start:dev
```

### 3️⃣ Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

### 4️⃣ Anwendung öffnen
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 📁 Projektstruktur

<details>
<summary>🎨 <strong>Frontend Architektur</strong></summary>

```
src/
├── 📄 pages/                    # Route-basierte Seiten
│   ├── admin/                   # Admin-Bereich
│   ├── member/                  # Mitglieder-Dashboard
│   └── LandingPage.vue         # Hauptseite
├── 🧩 components/              # Wiederverwendbare Komponenten
│   ├── layout/                 # Layout-Komponenten
│   ├── admin/                  # Admin-spezifische Komponenten
│   ├── member/                 # Member-spezifische Komponenten
│   └── ui/                     # UI-Grundkomponenten
├── 🛠️ services/               # API-Services & HTTP-Clients
├── 🎯 composables/             # Vue Composition Functions
├── 🧭 router/                  # Vue Router Konfiguration
├── 🎨 style/                   # Globale Styles & Themes
└── 📝 types/                   # TypeScript Typdefinitionen
```
</details>

<details>
<summary>🏗️ <strong>Backend Architektur</strong></summary>

```
src/
├── 🔐 auth/                    # Authentifizierung & Autorisierung
├── 👤 user/                    # Benutzerverwaltung
├── 📝 post/                    # Artikel-Management
├── 💬 comment/                 # Kommentar-System
├── 👥 friend/                  # Freundschaftssystem
├── 🎯 quiz/                    # Quiz-Engine
├── 🎫 ticket/                  # Support-Ticketsystem
├── 📧 mail/                    # E-Mail-Service
├── ☁️ cloudinary/              # Bild-Upload Service
├── 🛡️ common/                  # Shared Guards, Pipes, Decorators
└── 🗄️ prisma/                  # Datenbank-Service
```
</details>

---

## 🎯 Hauptfunktionen im Detail

### 📚 Artikel-System
- **Rich Text Editor** mit Markdown-Unterstützung
- **Kapitel-Management** für strukturierte Inhalte
- **Kategorisierung** und **Tagging**
- **Versionskontrolle** für Entwürfe
- **Kollaborative Bearbeitung**

### 🧠 Quiz-Engine
- **Multiple Choice** und **True/False** Fragen
- **Sofortiges Feedback** mit Erklärungen
- **Fortschritts-Tracking**
- **Leaderboards** und **Achievements**

### 👥 Community Features
- **Freundschaftssystem** mit Anfragen
- **Echtzeit-Chat** zwischen Freunden
- **Aktivitäts-Feed** für Community-Updates
- **Bewertungssystem** für Artikel und Kommentare

### ⚙️ Admin-Panel
- **Benutzer-Management** mit Rollenverwaltung
- **Content-Moderation** Tools
- **Analytics Dashboard** mit Metriken
- **Support-Ticketsystem**

---

## 🔧 Entwicklung & Best Practices

### Code Quality
```bash
# Linting & Formatting
npm run lint                    # ESLint Check
npm run format                  # Prettier Formatting

# Testing
npm run test                    # Unit Tests
npm run test:e2e               # End-to-End Tests
npm run test:coverage          # Coverage Report
```

### Git Workflow
```bash
# Feature Branch erstellen
git checkout -b feature/neue-funktion

# Commits mit Conventional Commits
git commit -m "feat: neue Artikel-Editor Funktion hinzugefügt"
git commit -m "fix: Behebung des Login-Bugs"
git commit -m "docs: README aktualisiert"
```

### Environment Variables
```env
# Backend (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/LearnToGrow"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
```

---

## 📊 Datenbank Schema

```sql
-- Kernmodelle
User {
  id, email, username, password_hash
  role: ADMIN | AUTHOR | MEMBER
  profile_data, preferences
  created_at, updated_at
}

Post {
  id, title, content, category
  author_id, status: DRAFT | PUBLISHED
  likes, dislikes, popularity_score
  created_at, updated_at
}

Quiz {
  id, post_id, questions[]
  passing_score, time_limit
}

Friendship {
  id, requester_id, addressee_id
  status: PENDING | ACCEPTED | BLOCKED
}
```

---

## 🚀 Deployment

### Docker Deployment
```bash
# Gesamte Anwendung mit Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Oder einzeln
docker build -t LearnToGrow-frontend .
docker build -t LearnToGrow-backend ./backend
```

### Umgebungsspezifische Builds
```bash
# Production Build
npm run build:prod

# Staging Build
npm run build:staging

# Development Build
npm run build:dev
```

---

## 📈 Performance & Monitoring

### Frontend Optimierungen
- **Code Splitting** mit Vue Router
- **Lazy Loading** für Komponenten
- **Image Optimization** mit Cloudinary
- **PWA Features** für Offline-Nutzung

### Backend Optimierungen
- **Database Indexing** für häufige Abfragen
- **Caching Strategy** mit Redis
- **Rate Limiting** für API-Endpunkte
- **Compression** für Response-Daten

---

## 🧪 Testing Strategy

### Frontend Tests
```bash
# Unit Tests mit Vitest
npm run test:unit

# Component Tests
npm run test:component

# E2E Tests mit Playwright
npm run test:e2e
```

### Backend Tests
```bash
# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# API Tests
npm run test:api
```

---

## 🛡️ Sicherheit

### Implementierte Sicherheitsmaßnahmen
- **JWT-basierte Authentifizierung** mit Refresh Tokens
- **CORS-Konfiguration** für sichere Cross-Origin Requests
- **Input Validation** mit class-validator
- **SQL Injection Prevention** durch Prisma ORM
- **Password Hashing** mit bcrypt
- **Rate Limiting** gegen DDoS-Angriffe

---

## 📖 API Dokumentation

### Authentifizierung Endpoints
```typescript
POST /auth/register          // Benutzerregistrierung
POST /auth/login            // Benutzeranmeldung
POST /auth/refresh          // Token erneuern
POST /auth/logout           // Abmeldung
```

### Artikel Endpoints
```typescript
GET    /posts               // Alle Artikel abrufen
GET    /posts/:id           // Einzelnen Artikel abrufen
POST   /posts               // Neuen Artikel erstellen
PUT    /posts/:id           // Artikel aktualisieren
DELETE /posts/:id           // Artikel löschen
```

### Community Endpoints
```typescript
GET    /friends             // Freundesliste
POST   /friends/request     // Freundschaftsanfrage senden
PUT    /friends/accept/:id  // Anfrage akzeptieren
DELETE /friends/:id         // Freundschaft beenden
```

---

## 🎨 Design System

### Farbpalette
```scss
// Primary Colors
$primary-50:  #f0f9ff;
$primary-500: #3b82f6;
$primary-900: #1e3a8a;

// Semantic Colors
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;
$info: #3b82f6;
```

### Typography
```scss
// Font Families
$font-primary: 'Inter', sans-serif;
$font-mono: 'Fira Code', monospace;

// Font Sizes
$text-xs: 0.75rem;
$text-sm: 0.875rem;
$text-base: 1rem;
$text-lg: 1.125rem;
$text-xl: 1.25rem;
```

---

## 🏆 Projektziele & Learnings

### Technische Ziele
✅ **Moderne Web-Architektur** mit Vue 3 & NestJS  
✅ **Type-Safe Development** mit TypeScript  
✅ **Responsive Design** für alle Geräte  
✅ **Performance Optimization** durch Code Splitting  
✅ **Sicherheit** durch bewährte Praktiken  

### Fachliche Ziele
✅ **User Experience** - Intuitive und ansprechende Benutzeroberfläche  
✅ **Skalierbarkeit** - Modulare Architektur für zukünftige Erweiterungen  
✅ **Wartbarkeit** - Sauberer, dokumentierter Code  
✅ **Testing** - Umfassende Test-Coverage  

---

## 🤝 Team & Beiträge

### Entwicklerteam
- **Frontend Development** - Vue.js, TypeScript, UI/UX
- **Backend Development** - NestJS, Prisma, API Design
- **DevOps & Deployment** - Docker, CI/CD Pipeline
- **Testing & QA** - Automated Testing, Manual Testing

### Projektmanagement
- **Agile Methodology** mit GitHub Projects
- **Code Reviews** für Qualitätssicherung
- **Dokumentation** für nachhaltigen Code

---

## 📞 Support & Kontakt

### Bugs & Feature Requests
Bitte erstellen Sie Issues auf GitHub mit detaillierten Beschreibungen und Reproduktionsschritten.

---

## 📜 Lizenz

Dieses Projekt wurde als Abschlussprojekt entwickelt und steht unter der MIT-Lizenz.

```
MIT License - Copyright (c) 2025 LearnToGrow Team
```

---

<div align="center">

**Entwickelt mit ❤️ als Abschlussprojekt**

</div>