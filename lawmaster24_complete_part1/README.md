# lawmaster24.com

KI-gestützte Rechtsassistenz-Plattform, die Nutzern ermöglicht, automatisierte rechtliche Einschätzungen und Vorabschreiben zu generieren, passende Anwälte zu finden, Dokumente hochzuladen und eine rechtliche Weiterbearbeitung anzustoßen.

## Funktionen

- Automatisierte rechtliche Einschätzungen zu allen Rechtsgebieten
- Generierung von Vorabschreiben
- Anwaltssuche mit Bewertungssystem
- Dokumenten-Upload und -verwaltung
- Rechtliche Weiterbearbeitung
- Bezahlmodell: 4,99€ pro Fall, ein Demo-Fall kostenlos
- Zahlungsabwicklung über Stripe und PayPal

## Entwicklung

```bash
# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Produktionsserver starten
npm run start
```

## Technologien

- Frontend: Next.js, React
- Backend: Node.js, Express
- Datenbank: MySQL
- Externe APIs: OpenAI, Google Maps, Stripe, PayPal

## Projektstruktur

- `/pages`: Next.js Seiten
- `/api`: API-Routen
- `/components`: Wiederverwendbare React-Komponenten
- `/styles`: CSS-Dateien
- `/public`: Statische Dateien
- `/models`: Datenbankmodelle
- `/config`: Konfigurationsdateien
