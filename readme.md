# 📘 Projektübersicht: Landing Page & Plattform für Artikel und Community

find . -type d -name "node_modules" -prune -o -type d -name ".git" -prune -o -print | sort > Projektstruktur.txt



Suchende Dateien: 

🔍 DEBUG INFO:

Recent Articles: 2 Artikel

Recommended Articles: 2 Artikel

Loading: false
Recommended Articles Daten:

[
  {
    "id": 33,
    "title": "Digitale Medien und Kinder: Chancen, Risiken und ein gesunder Umgang für Familien",
    "preview": "Digitale Medien sind aus dem Alltag von Familien heute nicht mehr wegzudenken. Dieser umfassende Artikel zeigt, welche Chancen und Risiken der Medienkonsum für Kinder birgt und wie Eltern den Umgang mit digitalen Geräten sinnvoll und gesund gestalten können.",
    "category": "FAMILY",
    "author": "Chrisautor",
    "date": "10.06.2025",
    "image": "https://res.cloudinary.com/dk1b3zsum/image/upload/v1749573949/posts/main/gkvtwfglhtdf4bqt25bs.webp",
    "readingTime": "1 Min.",
    "difficulty": "Mittel",
    "tags": [
      "Digitale Medien",
      "Kinder",
      "Erziehung",
      "Familienalltag",
      "Gesundheit"
    ]
  },
  {
    "id": 41078427,
    "title": "Stressbewältigung in der Familie – Wege zu mehr Gelassenheit und Zusammenhalt",
    "preview": "Familienalltag kann herausfordernd und stressig sein. In diesem Artikel erfährst du, wie du Stress besser erkennst, gezielt abbauen kannst und so zu einem harmonischeren Miteinander beiträgst.",
    "category": "HEALTH",
    "author": "Chrisautor",
    "date": "11.06.2025",
    "image": "https://res.cloudinary.com/dk1b3zsum/image/upload/v1749668536/posts/main/gx1htj76ljrmuh14jww9.webp",
    "readingTime": "1 Min.",
    "difficulty": "Mittel",
    "tags": [
      "Familienalltag",
      "Hallo"
    ]
  }
]
---

## 📁 Projektstruktur: Pages & Features

### 🔐 Login & Registrierung
- **Login**
  - Felder: `E-Mail`, `Passwort`
- **Register**
  - Felder: `Vorname`, `Nachname`, `Benutzername`, `Rolle`, `Geburtsdatum`, `Telefon`, `E-Mail`, `Passwort`, `Passwort bestätigen`

---

### 🏠 Landing Page
- Newsletter-Komponente
  - Felder: `Alter des Kindes`, `Vorname`, `E-Mail`

---

### 📬 Kontaktseite
- Felder: `Name`, `E-Mail`, `Betreff`, `Nachricht` (Textarea)

---

### 📚 Artikel & Bibliothek
- **Übersicht / Dashboard**
  - Anzeige aktuell gelesener Artikel mit State-Verwaltung
- **Meine Artikel**
  - Filter:
    - Alle
    - Leseliste (Noch nicht fertig)
    - Abgeschlossen
    - Favoriten
- **Library**
  - Anbindung aller verfügbaren Artikel
- **Favoriten**
  - Nur markierte Artikel werden angezeigt

---

### 👥 Community & Netzwerk
- **Freunde**
  - Verknüpfung von:
    - Alle Anfragen
    - Meine Freunde
- **Benachrichtigungen**
  - Kategorien:
    - Alle
    - Ungelesen
    - Artikel
    - Kommentare
    - Freunde
    - System (z. B. Admin-Nachrichten)

---

### ⚙️ Einstellungen / Settings
- **Profil**
  - Felder: `Vorname`, `Nachname`, `Benutzername`, `E-Mail`, `Telefon`, `Bio`
- **Konto**
  - Passwort ändern
- **Benachrichtigungen**
  - Benutzerdefinierte Einstellungen
- **Design**
  - Dark / Light Mode, Schriftgrößenwahl
- **Datenschutz**
  - Noch offene Fragen zur Integration

---

## 🛠️ Admin-Dashboard

### 👤 Benutzerverwaltung
- **Benutzersuche**
  - Suche via: `ID`, `Name`, `E-Mail`
- **Alle Benutzer**
  - Tabellen- oder Kartenansicht
- **Autorenübersicht**
  - Kartenansicht mit Kurzbeschreibung
  - Klick auf Card führt zur Detailseite/Konto

---

### 📝 Inhalte verwalten
- **Alle Posts**
  - Übersicht & Bearbeitung
  - Einsicht gemeldeter Beiträge
- **Support / Tickets**
  - Felder: `Name`, `E-Mail`, `Betreff`, `Nachricht`, `Kategorie`

---

### 🧑‍💻 Staff Team
- Übersicht aller Admins

---

