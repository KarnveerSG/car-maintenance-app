# Garage Keeper — Architecture Documentation

## Before/After Comparison

### Before (Original Structure)
- **Stack:** Create React App, JavaScript, styled-components
- **State:** Local component state, prop drilling
- **Structure:** Flat component structure, mixed concerns
- **Styling:** CSS-in-JS with styled-components
- **Type Safety:** None (JavaScript)

### After (Refactored)
- **Stack:** Vite 6 + React 18 + TypeScript (strict) + Tailwind CSS v3
- **State:** Zustand with persist middleware (localStorage)
- **Structure:** Clean architecture with separation of concerns
- **Styling:** Utility-first with Tailwind CSS, theme tokens
- **Type Safety:** Full TypeScript coverage

## Architecture Overview

### Layer Separation

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Pages, Components, Layout, Charts)    │
├─────────────────────────────────────────┤
│           State Management              │
│      (Zustand Store + Persistence)      │
├─────────────────────────────────────────┤
│           Business Logic                │
│   (Pure Engine Functions, no side FX)   │
├─────────────────────────────────────────┤
│           Type Definitions              │
│    (Domain Types, Constants, Schemas)   │
└─────────────────────────────────────────┘
```

## Project Structure

```
car-maintenance-app/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Router + theme sync
│   ├── index.css                   # Global styles + Tailwind
│   │
│   ├── types/
│   │   └── index.ts                # Domain types + constants
│   │
│   ├── engine/                     # Pure business logic
│   │   ├── format.ts               # Formatting utilities
│   │   ├── vehicles.ts             # Vehicle operations
│   │   ├── maintenance.ts          # Maintenance scheduling
│   │   ├── reminders.ts            # Reminder logic + events
│   │   ├── budget.ts               # Budget calculations
│   │   ├── analytics.ts            # Reporting + aggregations
│   │   └── index.ts                # Re-exports
│   │
│   ├── store/
│   │   └── useGarageStore.ts       # Zustand store + actions
│   │
│   ├── schemas/
│   │   └── forms.ts                # Zod validation schemas
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx       # Sidebar nav + outlet
│   │   ├── shared/
│   │   │   └── MetricCard.tsx      # Reusable metric card
│   │   └── charts/
│   │       └── MaintenanceCharts.tsx # Recharts visualizations
│   │
│   └── pages/
│       ├── OnboardingPage.tsx      # Initial setup/demo
│       ├── DashboardPage.tsx       # Overview + quick stats
│       ├── VehiclesPage.tsx        # Multi-vehicle management
│       ├── ServiceHistoryPage.tsx  # CRUD for service records
│       ├── RemindersPage.tsx       # CRUD for reminders
│       ├── BudgetPage.tsx          # Budget tracking + breakdown
│       ├── AnalyticsPage.tsx       # Charts + insights
│       └── SettingsPage.tsx        # Preferences + data mgmt
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Design Patterns

### 1. **Clean Architecture**
- **Engine layer:** Pure functions with no side effects, no React dependencies
- **Store layer:** Zustand for centralized state, actions call engine functions
- **UI layer:** Components consume store, trigger actions, display data

### 2. **Multi-Vehicle Pattern**
- Similar to Financial Tracker's multi-scenario pattern
- Each vehicle is independent with its own service records, reminders, budget
- Active vehicle selected via store action

### 3. **Persistence**
- Zustand `persist` middleware auto-saves to localStorage
- Export/import functionality for backups
- Partialize to avoid saving derived state

### 4. **Form Validation**
- Zod schemas for runtime validation
- React Hook Form + `@hookform/resolvers/zod` for forms
- Type-safe from schema to component

### 5. **Theme System**
- CSS custom properties via Tailwind config
- Dark mode by default, light mode toggle
- `garage-*` color palette (automotive theme)
- No pure black/white, uses theme tokens

## Key Features

### Dashboard
- Period-scoped budget display (monthly/yearly toggles)
- Recent service history
- Upcoming and overdue reminders
- Quick stats with trend indicators

### Multi-Vehicle Support
- Switch between vehicles via store action
- Each vehicle maintains independent state
- Add/edit/delete vehicles with safeguards

### Service History
- Complete CRUD operations
- Filter by category
- Inline editing
- Auto-update mileage history

### Reminders
- Date-based, mileage-based, or both
- Generate from maintenance schedule
- Mark complete/reopen
- Color-coded urgency (overdue, soon, upcoming)

### Budget Tracking
- Monthly and yearly budget settings
- Real-time spend tracking
- Category breakdown with visual progress bars
- Percentage usage indicators

### Analytics
- Lifetime spending metrics
- Cost per mile/kilometer
- Monthly spending trends (charts)
- Category breakdowns (pie/bar charts)

### Settings
- Currency and distance unit preferences
- Light/dark mode toggle
- Export/import data as JSON
- Reset all data with confirmation

## Data Flow

```
User Action → Component Event Handler → Store Action → Engine Function → State Update → Component Re-render
```

Example: Adding a service record
1. User submits form in `ServiceHistoryPage`
2. `onAdd` handler validates via Zod schema
3. Calls `addServiceRecord(data)` store action
4. Action calls engine functions (formatting, ID generation)
5. Updates `vehicles` array in store
6. Zustand persist middleware saves to localStorage
7. Components re-render with new data

## Type Safety

- **Strict TypeScript:** `tsconfig.json` with `strict: true`
- **No `any` types:** All functions and components fully typed
- **Runtime validation:** Zod schemas for user input
- **Type inference:** Zustand store state is fully inferred

## Migration Notes

### Breaking Changes from v1
1. **State structure:** Migrated from component state to Zustand
2. **Styling:** Replaced styled-components with Tailwind CSS
3. **Build tool:** Migrated from CRA to Vite
4. **Type system:** JavaScript → TypeScript

### Migration Path
1. Export data from v1 (if available)
2. Install v2
3. Use import feature to load v1 data (manual mapping may be required)

## Performance Optimizations

1. **Lazy loading:** Routes code-split automatically by Vite
2. **Memoization:** Zustand selectors prevent unnecessary re-renders
3. **Efficient updates:** Immutable updates via spread operators
4. **Persisted state:** Only serialize necessary fields

## Testing Strategy

- **Type checking:** `tsc -b` (no emit, types only)
- **Build validation:** `vite build` ensures bundle is clean
- **Manual testing:** All CRUD operations tested in browser
- **Future:** Add Vitest for unit tests, Playwright for E2E

## Dependencies

### Core
- `react@18.3.1` + `react-dom@18.3.1`
- `react-router-dom@7.1.1` (routing)
- `zustand@5.0.3` (state management)

### Forms & Validation
- `react-hook-form@7.54.2`
- `zod@3.24.1`
- `@hookform/resolvers@3.10.0`

### Charts
- `recharts@2.15.0`

### Build Tools
- `vite@6.0.7`
- `typescript@5.7.3`
- `tailwindcss@3.4.17`

## Future Enhancements

1. **API integration:** Optional cloud sync with Hono backend
2. **Attachments:** Photo uploads for service receipts
3. **Calendar view:** Maintenance timeline visualization
4. **Sharing:** Share vehicle reports as PDF
5. **Notifications:** Browser notifications for upcoming reminders
