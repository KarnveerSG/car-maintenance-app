# Garage Keeper

A local-first car maintenance tracker built with React, TypeScript, and Tailwind CSS. Track multiple vehicles, service history, budgets, reminders, and maintenance schedules — all stored in your browser.

## Features

### Dashboard
- Vehicle overview with current mileage and spend metrics
- Monthly/yearly budget tracking with usage indicators
- Recent service history at a glance
- Reminders grouped by urgency (overdue, due soon, upcoming)
- Schedule overdue and due-soon counts from the maintenance engine

### Multi-vehicle support
- Add, edit, delete, and switch between vehicles
- Full profiles: make, model, year, VIN, license plate, color, driving condition
- Independent service history, reminders, budget, and mileage per vehicle

### Service history
- Full CRUD for maintenance records
- Filter by service category
- Track cost, mileage, date, shop, and notes
- Status: completed or scheduled
- **Receipts & attachments:** attach photos (JPEG, PNG, WebP, GIF) or PDFs per record (up to 5 files, 2 MB each)

### Calendar & timeline
- **Calendar view:** month grid with events on each day; click a day for details
- **Timeline view:** vertical chronological feed grouped by month
- Combines completed/scheduled services, reminders, mileage logs, and projected maintenance

### Smart reminders
- Date-based, mileage-based, or both
- Auto-generate from built-in maintenance schedules
- Color-coded urgency badges
- Active and completed tabs

### Mileage logging
- Log odometer readings with date on the Vehicles page
- History list sorted newest-first
- Feeds mileage estimation for reminder and schedule calculations

### Budget management
- Monthly and yearly budgets per vehicle
- Real-time spend tracking for the current period
- Category breakdown with progress bars

### Analytics
- Lifetime spend and cost-per-distance metrics
- Monthly spending bar chart
- Category pie chart and top-category rankings

### Settings & data
- Currency: USD, CAD, EUR, GBP
- Distance unit: miles or kilometers
- Light/dark mode
- Export full app state as JSON backup
- Import from JSON backup
- Reset all data

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18 + TypeScript (strict) |
| Build | Vite 6 |
| Styling | Tailwind CSS v3 (`garage-*` theme tokens) |
| State | Zustand 5 + `localStorage` persistence (`garage-keeper-v2`) |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Tests | Vitest |

All business logic lives in pure functions under `src/engine/` so it can be unit-tested without the UI.

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Install and run

```bash
cd car-maintenance-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

On first launch, choose **Get started** (blank) or **Explore demo** (pre-loaded Toyota Corolla sample data).

### Production build

```bash
npm run build
npm run preview   # serve the dist/ output locally
```

## Testing (regression suite)

Unit tests cover the engine layer, Zod schemas, and export/import helpers. Run them before merging changes or cutting a release.

```bash
# Run all tests once
npm test

# Watch mode during development
npm test:watch

# Full gate: tests + TypeScript + production build
npm run check
```

### What is tested

| Area | File(s) | Covers |
|------|---------|--------|
| Maintenance schedules | `engine/maintenance.test.ts` | Upcoming services, overdue/due-soon counts |
| Reminders | `engine/reminders.test.ts` | Urgency evaluation, schedule → reminder generation |
| Budget | `engine/budget.test.ts` | Period spend, budget status |
| Timeline / calendar | `engine/timeline.test.ts` | Event building, date filtering, month grid |
| Attachments | `engine/attachments.test.ts` | MIME validation, size limits |
| Formatting | `engine/format.test.ts` | Dates, distance, clamp, month math |
| Vehicles | `engine/vehicles.test.ts` | Factory defaults, mileage estimation |
| Analytics | `engine/analytics.test.ts` | Category and monthly spend aggregation |
| Form schemas | `schemas/forms.test.ts` | Zod validation for all forms |
| Data backup | `store/useGarageStore.test.ts` | JSON export/import round-trip |

Add a new test in the matching `*.test.ts` file whenever you change engine logic, schemas, or export format.

## Usage guide

### Daily workflow
1. **Dashboard** — check budget, reminders, and recent services
2. **Service History** — log completed work or upcoming appointments (attach receipts when needed)
3. **Vehicles** — update profile or log a new odometer reading
4. **Calendar** — see everything on a month grid or timeline
5. **Reminders** — review urgency, generate from schedule, mark complete
6. **Budget / Analytics** — track spend against goals

### Maintenance schedules
Built-in intervals adapt to driving condition set on each vehicle:

- **Normal** — mostly highway, mild climate, regular trips
- **Severe** — short trips, towing, dust, extreme heat/cold, stop-and-go

Includes oil changes, tire rotation, brake inspection, filters, fluids, spark plugs, transmission service, and more. View projections on **Reminders** (schedule preview) or **Calendar**.

### Attachments
1. Open **Service History** → add or edit a record
2. Use **Receipts & photos** to pick image or PDF files
3. Thumbnails appear on the record card; click to open or download

Attachments are stored as base64 inside `localStorage`. Keep exports lean by not attaching huge files.

### Data backup
1. **Settings → Data Management → Export Backup** — downloads JSON
2. **Import Backup** — paste JSON to restore (replaces current data)

> **Warning:** Data lives only in your browser. Clearing site data deletes everything. Export regularly.

## Project structure

```
car-maintenance-app/
├── src/
│   ├── components/
│   │   ├── layout/          # App shell, sidebar, page header
│   │   ├── shared/          # MetricCard, ServiceAttachments, etc.
│   │   └── charts/          # Recharts wrappers
│   ├── engine/              # Pure business logic (+ *.test.ts)
│   ├── pages/               # Route-level screens
│   ├── schemas/             # Zod form schemas (+ tests)
│   ├── store/               # Zustand store + export helpers
│   ├── types/               # Shared TypeScript types
│   ├── App.tsx              # Router and theme sync
│   └── main.tsx             # Entry point
├── vitest.config.ts
├── vitest.setup.ts          # localStorage / crypto stubs for tests
├── ARCHITECTURE.md          # Design notes
└── README.md
```

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production bundle → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run Vitest regression suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run check` | `test` then `build` — use before releases |

## Browser support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires ES2020+, `localStorage`, and `crypto.randomUUID`.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for layer diagram, data flow, and migration notes.

## Roadmap

### Done
- [x] Multi-vehicle profiles and switching
- [x] Service history CRUD with category filters
- [x] Photo/PDF attachments on service records
- [x] Calendar and timeline views
- [x] Mileage logging
- [x] Smart reminders with schedule auto-generation
- [x] Budget tracking and analytics charts
- [x] Export/import JSON backups
- [x] Vitest regression suite

### Planned
- [ ] PDF export for reports
- [ ] Browser notifications for reminders
- [ ] Optional cloud sync (Hono + SQLite backend)
- [ ] Fuel economy / trip logging
- [ ] Vehicle value tracking

## Version history

### v2.1.0
- Calendar & timeline page
- Service record photo/PDF attachments
- Mileage log on Vehicles page
- Reminder urgency styling and schedule preview
- Vitest regression suite (`npm test`, `npm run check`)
- Legacy CRA artifacts removed

### v2.0.0
- Vite + TypeScript + Tailwind refactor
- Zustand persistence, multi-vehicle support
- Budget, analytics, reminders, export/import

### v1.0.0 (legacy)
- Create React App, JavaScript, styled-components

## License

MIT
