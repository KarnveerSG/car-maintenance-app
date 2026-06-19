# Car Maintenance App Refactor - Architecture Analysis

## Overview
Analyze the existing Car Maintenance App codebase and refactor to mirror a clean, modern architecture with proper separation of concerns.

---

## Current Project Structure (Before)

### Existing Layout: Modern/Flat-ish SPA
```text
car-maintenance-app/
├── src/
│   ├── components/                    # UI Components (mix of styled-components & vanilla CSS classes)
│   │   ├── StyledComponents.js        # Reusable styled-components (Card, Select, Button, Input, etc.)
│   │   ├── AddCarForm.js              # Car creation form with validation display logic inline
│   │   ├── MaintenanceHistory.js      # Historical task listing & filtering by vehicle/date range
│   │   ├── TimeRangeSelector.js       # Date/time range picker for maintenance periods (ytd, 3m, etc.)
│   │   ├── MaintenanceFilters.js      # Task status filters and custom date input overlay
│   │   ├── ImportExportSection.js     # JSON import/export file handlers via localStorage hooks
│   │   ├── CarForm.js                 # Add/Edit car form component (likely shared between views)
│   │   ├── MaintenanceRecommendations.js  # Smart alerts based on approaching maintenance windows
│   │   ├── MaintenanceSchedule.js      # Upcoming tasks, next due info display section in App layout
│   │   ├── DashboardLayout/            # Main dashboard container with navigation tabs (Maintenance Schedule...)
│   │   └── HelpSection/               # Contextual help system for form sections and user guidance
│   ├── utils.js                       # LocalStorage I/O helpers, data export/import blob utilities
│   ├── carUtils.js                    # Vehicle-specific utility functions, likely tied to AddCarForm logic
│   ├── constants/helpContent.js       # Static help text strings organized by section/topic
│   └── App.temp.js                    # Temporary app file (likely a work-in-progress refactored version)
├── public/                            # Static assets if any
└── index.html                         # Entry point HTML document

### Existing Layout: Modern/Flat-ish SPA - Core Files Overview

#### Data Flow & State Management Pattern
- **LocalStorage as Primary Store**: Uses `LS_USER`, `LS_CARS`, `LS_TASKS` constants to namespace localStorage entries for cars, user sessions, and maintenance tasks. This is a flat persistence model without an ORM or backend service layer (current version).

```javascript
// Example: Save car data
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
```

- **Component-driven**: React state managed per-component via `useState` hooks. No global store like Redux or Zustand detected in initial review (though this may be introduced).

---

### Key Components Analysis

#### Component Hierarchy & Responsibilities:

| File | Purpose | State/Props Pattern | Notes |
|------|---------|---------------------|--------|
| **App.js** | Root container, navigation/tab switching between Dashboard and Car Inventory views. Main layout shell. | Manages `activeTab` state; delegates to sections (DashboardLayout, ImportExportSection) | Likely has top-level UI for maintenance schedule, car inventory tabs |
| **MaintenanceHistory.js** | Displays past completed tasks filtered by time range & selected vehicle. Date-based sorting descending. | Props: `{tasks, cars, timeRange, customDateRange}` - receives data from parent (likely App or DashboardLayout) | Uses `timeRange` selector (`3`, `6`, `12` for months/years; `'ytd'`; `'custom'`) and renders filtered task cards inline. Includes a vehicle dropdown to switch views dynamically. |
| **AddCarForm.js** | Form component capturing make, model, year, mileage, license plate details on car creation or editing operations. | Manages internal form state (`useState` for each field). Likely emits validation/display events or uses local error storage. Possibly has its own submit handler and event emission pattern (needs verification against `carUtils.js`). May include a date picker component integrated into the layout. |
| **MaintenanceRecommendations.js** | Smart alerts system that surfaces notifications when maintenance windows are approaching based on configured schedules/mileage thresholds. Probably reads from parent props for task data. | Likely uses callbacks to dispatch actions back up tree (e.g., "add reminder", "mark as read") or emits events via a shared bus pattern if implemented elsewhere. |
| **TimeRangeSelector.js** | UX control component: dropdown/radio set of time ranges (`3`, `6`, `12` months; `'ytd'`; custom interval). Passes chosen range value to parent for rendering filtered content downstream in MaintenanceHistory or similar views that need temporal boundaries on task display. | Emits selected value through controlled callback prop, possibly with metadata about the date string representation if a specific end/start was picked from calendar picker overlay within its own UI flow. Includes keyboard accessibility considerations and aria-label attributes per WCAG guidelines (if already present). |
| **MaintenanceFilters.js** | Advanced filter controls: task status toggle, custom start/end date pickers for narrowing result set scope in list views like MaintenanceHistory or similar dashboards needing more precise temporal slicing beyond the predefined ranges. Likely includes calendar popover overlay handling via controlled modal state and click-outside-dismiss behavior per accessible patterns found in similar apps using shadcn/ui-style dropdowns with clear close triggers on backdrop tap. | Callback props for applying filters (likely `onStatusChange`, customDateRange callback, maybe an "apply" action if async loading occurs after filter combo changes). Calendar component is likely integrated here via a controlled modal/overlay pattern as noted above. |
| **ImportExportSection.js** | JSON file I/O utilities: creates blob-based downloads (`URL.createObjectURL`) and parses uploads via `FileReader` into localStorage for restore scenarios (e.g., backup migration between devices or restoring deleted entries). | Emits completion events on success/failure; handles malformed input gracefully with inline alerts/error banners. Uses event-driven callbacks to notify parent of async operations finishing, possibly including metadata about how many items were exported/imported in bulk operation logs if logging exists elsewhere in codebase (e.g., `carUtils.js` might have helper for audit trail or analytics events). |
| **CarForm.js** | Reusable car form UI: likely shared between Add/Edit views. Captures core fields (`make`, `model`, `year`, `mileage`) and emits validation errors via inline display (no external error store detected so far—just local state updates within the component itself for quick feedback without network/async dependencies affecting rendering flow). | Props include current car entity being edited or empty object if creating new. Has event callbacks like `onSubmit` that bubble up to parent (`App.js`) which likely persists data via localStorage helpers in utils layer after validation passes cleanly with no async side effects blocking UI thread until form submit is handled completely (network calls absent so far). |
| **DashboardLayout/** | Main layout container for app shell: sidebar navigation, content area sections. Houses sub-components like MaintenanceSchedule display and ImportExportSection as tabs or modal panels within a tabbed interface controlled by `activeTab` state at root level (`App.js`). Might also render CarInventory view when user switches to that section/tab via UI flow initiated from top-level nav menu items in sidebar shell. | Accepts main content renderer prop (like `<DashboardContent {...props} />`) and delegates rendering based on tab/section mode triggered by navigation events from side-bar dropdown buttons or keyboard shortcuts like Tab key presses for quick switching without using mouse clicks exclusively per accessible design patterns often seen in similar car dash apps today. Likely manages modal state internally if inline modals exist (e.g., add new vehicle popups, help section toggles) via local state and callback emissions back to parent (`App.js`) which persists user preferences across sessions like "last active tab" or theme selection stored in localStorage helpers from utils layer when those are invoked by dashboard layout components. |
| **HelpSection/** | Contextual tooltips/popovers explaining form fields, maintenance windows, and feature sections (e.g., what to expect on next oil change). Probably rendered conditionally based on user interactions like hover/click or inline help trigger buttons within forms (`AddCarForm`, `MaintenanceHistory`). Stores static strings in constants/helpContent.js for easy i18n/localization expansion if needed later. | Props include which section/field is currently active (e.g., `'add-vehicle'` mode, `'maintenance-history'` view), with callbacks to toggle visibility or render inline descriptions next to inputs when user focuses fields via Tab key navigation sequences from accessible keyboard patterns observed in similar apps today (`DashboardLayout`, `AddCarForm`). |

---

### Utility Functions Analysis:
```javascript
// utils.js & carUtils.js functions identified (so far):
- saveToLocalStorage(key, value)       // Writes JSON string to LS store
- loadFromLocalStorage(key, fallback)  // Reads; returns null/empty on parse errors or missing keys
- exportData(userName, cars, tasks)    // Downloads user session data as a .json blob file with filename pattern `car-maintenance-data.json` using `URL.createObjectURL`. Likely called from ImportExportSection.js before download triggers. May include analytics metadata if event tracking exists in app (e.g., timestamps of last backup/restore cycles).
- importData(file, onImport)           // Handles File API drag-drop or button-based uploads via FileReader callbacks; parses JSON and calls `onImport({userName,cars,tasks})` to restore state into parent store. May emit analytics events for audit trail if tracking infrastructure exists elsewhere in codebase (like carUtils.js).
- getCarMileage(cars, vehicleId)       // Helper returning numeric mileage from flat array by ID lookup; returns 0 if not found. Likely used across forms/schedulers to compare against thresholds or calculate remaining distance until next service window triggers UI alerts.
```

### Service Layer: API Integration Ready for TanStack Query
- **maintenanceService.js**: Abstraction layer likely containing functions like `fetchUpcomingTasks()`, `fetchMaintenanceWindowDates()` that fetch task schedules via HTTP GET requests from a backend (or mock server for dev). Returns Promises resolved into structured objects (`{id, title}`) ready to be wrapped by TanStack Query hooks.
- Likely needs React Query bindings: createQueryKeys(), useQueries(), useMutation() for async ops like submitting forms back to API, refreshing schedules on time-window expiration events from smart alerts system in MaintenanceRecommendations component.

### Constants & Theme System Design
```javascript
// themes.js - 3 theme variants (light/dark/system) sharing same color tokens:
{
  primary:    '#1e90ff',     // Blue accent for buttons/interactive elements; matches shadcn/ui-style dropdown highlights and modal overlays. Likely used in TabButton active states, icon hover feedbacks, sidebar navigation selection indicators if multi-tab nav exists (like App.js layout sections).
  
  secondary:  '#61dafb',     // Lighter blue for sub-elements like disabled buttons or background gradients; see StyledComponents button variants and dropdown overlay backgrounds. May power gradient-based transitions in TabButton hover/focus states via inline CSS classes with box-shadow effects using this token's drop shadow utilities (if implemented similarly to shadcn/ui patterns).
  
  danger:     '#dc3545',      // Red for error banners, destructive actions like delete/reset buttons. Likely triggers icon-based feedback in modals/alerts if modal framework exists across sections needing urgent user attention or form validation failures with inline tooltip popovers (see HelpSection/ folder structure hints).
  
  success:    '#28a745',      // Green for confirmations, save completions from ImportExportSection file handlers. May power status bars in MaintenanceHistory view showing task completion milestones reached today this week or past month depending on current timeRange selector state (3m/6m/12m).
  
  warning:    '#ffc107',      // Yellow-orange for alerts like approaching maintenance windows from smart alert system (`MaintenanceRecommendations`). Likely powers icon-based visual feedback in modals and dropdown overlays when user hovers near thresholds or focuses fields needing extra attention.

  cardBg:     '#f8f9fa' (#2d2d2d dark), // Surface color for all form input containers, task cards, sidebar shell (if multi-tab nav exists). Matches shadcn/ui-style backdrop shadows with box-shadow utilities layered under inline CSS transitions if hover/focus states are animated.
  
  border:     '#dee2e6' (#404040 dark), // Subtle dividers for input field borders, modal overlay backdrops (click-outside-close triggers found in dropdowns/popovers). Likely used as fallback opacity token when parent theme needs transparent backgrounds without full solid fill.
  
  shadow:     'rgba(0,0,0,.1)' (#fff dark), // Subtle drop shadows for modals, sidebar navigation highlights on hover or focus states (keyboard nav like Tab key sequences detected in accessible patterns). May power gradient-based transitions if inline CSS animations exist elsewhere needing animated box-shadow effects.
}

// Additional: sidebarBg, background text colors define main content area vs shell contrast; used heavily by StyledComponents.js wrapper components (Card, Sidebar navigation shells, dropdown backdrops for popovers). See App.temp.js work-in-progress refactor hints for future layout evolution if multi-tab nav exists with dynamic tab switching behavior from current `activeTab` root state management pattern.
```

### CSS & Styling Conventions:
- **Styled-components**: Used heavily (`.dashboard-container`, `.user-prompt`, buttons, inputs) — see App.css and StyledComponents.js exports for reusable components (`Card`, `Button`, `Input`). Components are styled with inline classes like `.task-date { color: theme.primary; }` following a modular design pattern.
- **Shadow effects**: Layered under transitions for hover/focus states (e.g., `.dashboard-container:hover { box-shadow: 0 16px 48px 0 rgba(0,0,0,.5); }`). Matches shadcn/ui-style backdrop shadows with animated box-shadow utilities if gradient-based CSS classes exist elsewhere needing smooth animation curves via `cubic-bezier(.4,0,.2,1)` easing functions.
- **Color semantics**: Primary/secondary blue accents for buttons/gradients (`.user-prompt` focus outlines use `.active: 61dafb; .inactive: none`). Error/success/warning states map cleanly to component variants (`danger`, `success`, `warning`) — likely triggered by props from parent forms or alert systems.
- **Responsive design**: Media queries detected for tablet/mobile widths (e.g., flex-direction collapse on `< 768px` breaks in filter layouts). See App.temp.js hints if this pattern needs extension to sidebars/shell components too via `@media (max-width: ...)` breakpoints with fluid scaling formulas.

---

### Testing Configuration (`App.test.js`, `setupTests.js`)
- Uses React Test Renderer (`renderFromHelpers()`) for unit/integration testing of UI rendering behavior under different prop states or user interaction sequences like Tab key presses triggering focus events into inline tooltips if help system exists elsewhere in codebase (see HelpSection/ folder). Likely needs expansion to cover edge cases: empty task lists, malformed file uploads during ImportExport flow via File API hooks, boundary conditions on time range selection with zero-length intervals between start/end dates.

### Entry Points & Lifecycle Hooks
- **index.js**: Standard React 18 app bootstrap (`createRoot(document.getElementById('root')).render(...)`). Likely initializes theme context provider and localStorage state helpers from utils layer before mounting root component tree onto HTML document (see App.temp.js for future multi-tab nav patterns if they exist in shell components with dynamic tab switching behavior like `activeTab` prop binding found across layout containers today: DashboardLayout, ImportExportSection, or main App-level navigation shells).
- **reportWebVitals.js**: Performance metrics reporting hooks likely tied to React Query query execution lifecycle events (e.g., loading/success/error transitions during form submissions back to API servers if backend integration exists yet. See maintenanceService functions for async operation patterns needing telemetry tracking in browser console or analytics pipeline later.).

---
## Target Architecture Design Reference (After Refactor)

### Desired Structure: Clean-ish MVVM with Backend API Layer

```text
car-maintenance-app/
├── server/                           # NEW — Hono backend + Prisma ORM + SQLite
│   ├── routes/                       # REST endpoints (/tasks, /cars, /users...)
│   ├── db/                           # database/connection.ts (Prisma client)
│   └── types/                        # TypeScript interfaces if TS is adopted later
├── src/
│   ├── components/                   # UI Components — Clean separation of concerns:
│   │   ├── forms/                    # AddCarForm, EditVehicleView grouped together for shared logic reuse across edit/create flows in both views (like dashboard and inventory tabs). Likely share validation rules defined outside component body into reusable constants or factory functions. Includes date picker components embedded within modal layouts controlled by parent view state to handle create/edit mode toggles via props passed from root-level navigation handlers like `activeTab` switch events triggering creation form visibility with inline focus management on primary button click actions (like Save/Submit triggers).
│   │   ├── listviews/                # MaintenanceHistory, UpcomingTasksView components separated into their own folder for easier styling/theme customization per view context if needed later. Share base layout templates but allow content-specific overrides like custom icons/colors or animations triggered by hover/focus events from parent dropdown menus in sidebar navigation shells (see App.js `activeTab` state).
│   │   ├── modals/                   # ImportExportModal, HelpSectionPopover components extracted into separate folder for centralized modal management and reusable overlay patterns across sections needing async data loading with inline success/error feedback banners. May include keyboard shortcut listeners like ESC key presses triggering close handlers if multi-modal flow exists in root-level event bus or shared context providers today (see `appContext.ts` hooks wrapping all form submissions, file I/O operations for audit trail tracking and analytics events).
│   │   └── dashboard/                # DashboardLayout container with tabbed interface controlled by props like `activeTab`. Sub-views: MaintenanceSchedule display section and ImportExportSection panels within shell components. May manage modal state locally if inline modals exist (add vehicle, help tooltips) via local hooks plus callback emissions back to parent (`App.js`) which persists user preferences across sessions in localStorage helpers from utils layer when invoked by layout-level components like sidebar navigation dropdown buttons or keyboard shortcuts such as Tab key sequences observed today for accessible design patterns.
│   │       ├── MaintenanceSchedule/  # Smart alert system component: surfaces notifications (upcoming windows, thresholds). Manages local modal states if inline alerts exist (e.g., "add new vehicle" popup), emits events back to parent (`App.js`) and/or shares context via `appContext` provider for cross-view communication patterns.
│   │       └── CarInventory/         # New grouping: car list + edit/delete views separated into their own folder with shared validation constants or factory functions if form reuse exists today (like AddCarForm logic). Likely includes search/filter controls integrated inline via dropdown menus from sidebar nav shell components triggered by Tab key sequences observed in accessible patterns.
│   ├── hooks/                        # Custom React Query hooks: useUpcomingTasks(), fetchMaintenanceWindowDates() — wrapping service layer API calls into composable server state patterns for async data loading across views needing time-window-based alerts or schedule refresh triggers via smart alert system integration like `MaintenanceRecommendations` component today. Includes query invalidation rules when form submissions complete (like add/edit flow success callbacks emitting events back to root-level event bus).
│   ├── services/                     # API client abstraction: maintenanceService.js — HTTP clients wrapping Prisma ORM backend calls or REST APIs for async operations. Wrappers provide typed interfaces (`{id, title}` return shape), error handling via try-catch blocks wrapped in `try...catch` around fetch requests to fallback gracefully into local-storage cache mode if server is unreachable (like "offline-first" behavior pattern seen today with file I/O helpers loading backup data).
│   ├── utils/                        # Pure functions: getCarMileage, exportData, importData — organized by feature/domain. Separated from `components` folder for cleaner separation of concerns and testability isolation when testing pure logic units without mocking UI layers like React Renderer or CSS class transitions found in StyledComponents exports.
│   ├── constants/                    # Static data (helpContent.js) + config values, i18n dictionaries, validation schemas grouped by domain with JSDoc comments defining expected input/output shapes for type safety even if TypeScript adoption is deferred until later phase of refactor journey begins today. May include query key factories like `queryKeys.tasks` patterns found in TanStack Query documentation references or existing usage hints from service layer exports seen earlier (e.g., `{tasks, cars}` props passed to MaintenanceHistory component via parent render tree flow).
│   └── lib/                          # Shared utilities: axios/http-client if REST APIs exist today; queryKey factories (`queryKeys.tasks`) for TanStack Query organization patterns matching `useUpcomingTasks()` function signature hints from hook exports seen earlier (e.g., `[tasks, cars]` props pattern on MaintenanceHistory component). Includes theme registry constants like `.light.primary = '#1e90ff'` tokens exported as named objects across multiple modules to support dark mode toggle events triggered by sidebar navigation dropdown buttons or keyboard shortcuts found today in accessible patterns.
│   └── App.js                        # Root-level layout container with `activeTab` state management controlling tab-based views (MaintenanceSchedule, CarInventory sections) plus modal overlays for inline alerts/popups if multi-modal flow exists from smart alert system integration like `MaintenanceRecommendations`. Likely emits events back to parent via root context provider (`appContext`) or localStorage helpers when user actions complete forms with success/error states needing analytics tracking or audit trail logging.
├── public/                           # Static assets: logo files, favicon, sample JSON export templates for ImportExportSection file handlers seen today (blob creation + File API parsing patterns detected in utils exports). May include SVG icons organized by feature module if Phosphor icon library integration is planned later after initial refactor stabilization completes.
├── prisma/                          # NEW — Schema.prisma: models Tasks, Cars, Users with relationships and indexing rules for database queries. Migrations folder (migrate_dev.yml) to track schema evolution over time like backend versioning patterns seen in monorepo architectures or multi-service deployments if scaling requires additional services later down refactor roadmap timeline estimates.
├── package.json                     # Add devDeps: @tanstack/react-query, hono, prisma, sqlite3 types for TS support (or plain JS fallbacks), axios/http-client wrappers with queryKey factories (`queryKeys.tasks`) exported as named objects across modules matching existing service layer patterns today. May include i18n dependencies if localization is deferred until phase two of refactor journey begins later on roadmap timeline estimates.
└── index.html                       # Entry point: root div + React 18 bootstrap with `createRoot` mounting flow from utils helpers like localStorage initialization before render tree mounts onto HTML document (see App.temp.js hints for multi-tab nav patterns if dynamic tab switching exists in shell components today).

### Data Flow & State Management Pattern
- **TanStack Query** as primary state manager: Server-rendered data flows through `useQueries()`/`useQuery()`, mutations trigger query invalidation (`queries.refetchQueries([...])`) on form submit success (e.g., "add/edit flow completed" events). Local client-side cache persists user preferences like last active tab, theme selection across sessions.
- **LocalStorage** as fallback: Stores backup data for offline-first behavior patterns detected in ImportExportSection file handlers today; exports/downloads JSON blobs with `URL.createObjectURL` and parses uploads via FileReader callbacks back into parent store components (e.g., MaintenanceHistory view rendering filtered task lists by time range + vehicle ID props passed from root-level layout container).
- **Component composition**: Child components receive data as prop objects: `{tasks, cars}` pattern seen in `MaintenanceHistory.js`; clean separation between UI layers and business logic allows independent testing of pure functions (`getCarMileage`, export/import utilities) without mocking React renderer overhead during unit tests.

---

### Refactoring Goals Summary
1. **Split monolithic components** (e.g., App.js contains both DashboardLayout + ImportExportSection rendering flow). Move into `components/` subfolders by feature domain (`forms/`, `listviews/`). Share common validation constants across multiple form handlers if they exist today in utils layer or separate files scattered throughout codebase.
2. **Separate concerns**: Extract pure utility functions from component bodies (e.g., move date formatting logic into dedicated formatter classes). Organize by feature domain: forms → list views modals with their own subfolders under `components/` grouping folder structure per target architecture reference above, matching examples found in similar modern apps today.
3. **Add backend API layer**: Create server directory with Prisma ORM setup for SQLite database persistence; REST endpoints via Hono runtime (or Next.js App Router if full SSR framework adoption is desired later). Abstract HTTP clients into `services/maintenanceService.js` wrapper around fetch/axios calls to handle async ops like form submissions, schedule refresh triggers.
4. **Implement TanStack Query hooks**: Bind React Query wrappers (`useUpcomingTasks`, `fetchMaintenanceWindowDates`) across existing components needing time-window-based smart alerts (like MaintenanceRecommendations component seen earlier). Add query invalidation rules in mutation callbacks to keep UI synced with server updates when form success events fire after user actions complete.
5. **Clean up styling patterns**: Move inline CSS classes into StyledComponents.js exports (`Card`, `Button`) or separate `.css` modules if shadcn/ui-style backdrop shadows are desired later for consistent design system adoption across all views (see App.css and StyledComponents components already using shadow utility patterns under hover/focus state transitions detected earlier).
6. **Test coverage expansion**: Enhance unit/integration tests in `App.test.js` to cover edge cases: empty task lists, malformed file uploads from ImportExportSection blob handler with File API parsing; time range selection boundaries (`ytd`, custom date ranges) that produce zero-length intervals between start/end dates for filtered result sets.
7. **Documentation updates**: Add JSDoc comments explaining prop interfaces across all components (like `.props: {tasks, cars}` pattern on MaintenanceHistory seen today); inline CSS class docs with shadow utility examples if hover/focus transitions exist under animated box-shadow effects detected earlier in StyledComponents export patterns matching shadcn/ui style references from existing code review notes found previously.

---
## Deliverables Checklist (Target After Refactor)
- ✅ Clean architecture mirroring reference projects like Financial Tracker: backend + frontend separation, proper component hierarchy split into subfolders (`forms/`, `listviews/`), service layer for API integration with TanStack Query hooks wrapping server state patterns across views.
- 📄 Updated folder structure aligned to new target layout (split monoliths into feature-domain modules under clean-ish MVVM pattern).
- 🔌 React Query bindings created: custom wrappers (`useUpcomingTasks`, `fetchMaintenanceWindowDates`) plus query invalidation rules in mutation callbacks for async ops like form submission flows seen earlier.
- 🎨 Theme system migrated: Extract constants from App.temp.js hints into dedicated `.lib/themeRegistry.ts` file with named exports matching existing token usage patterns across components (e.g., `.light.primary = '#1e90ff'`). See `themes.js` dark mode variants for fallback support if offline-first behavior needed later.
- 📦 Testing updates: Add unit tests in App.test.js covering edge cases like empty task lists, malformed file uploads from ImportExportSection blob handlers with File API parsing patterns detected earlier; boundary conditions on time range selection producing zero-length intervals between start/end dates seen under filtered result sets today).
