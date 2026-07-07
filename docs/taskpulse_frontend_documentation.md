# TaskPulse Frontend — Complete UI/UX Documentation

> Use this document as a prompt for Orchids AI (or any other AI design tool) to redesign the TaskPulse frontend. It covers every page, every component, the design system, interactions, and existing shortcomings.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (with React Compiler via Babel) |
| Build Tool | Vite |
| Routing | React Router v6 (nested routes) |
| Styling | TailwindCSS v3 + custom CSS variables (`--tp-*` prefix) |
| UI Primitives | shadcn/ui (Badge, Command Dialog) |
| Icons | Lucide React + custom inline SVGs |
| Font | **Geist Variable** (body), **Inter** + **Outfit** (landing page) |
| Drag & Drop | @hello-pangea/dnd (Kanban board) |
| Dates | date-fns |

---

## 2. Design System

### 2.1 Color Palette

The app supports **Light** and **Dark** modes via CSS custom properties.

#### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#F9FAFB` | Page background |
| `--bg-surface` | `#FFFFFF` | Card / panel background |
| `--text-primary` | `#0F172A` | Primary text |
| `--text-muted` | `#64748B` | Secondary / hint text |
| `--accent` | `#6366F1` | Indigo — primary brand accent (buttons, highlights) |
| `--border-subtle` | `#E2E8F0` | Borders, dividers |

#### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#09090B` | Page background (near-black) |
| `--bg-surface` | `#18181B` | Card background |
| `--text-primary` | `#FAFAFA` | Primary text |
| `--text-muted` | `#A1A1AA` | Muted text |
| `--accent` | `#818CF8` | Lighter indigo for dark mode |
| `--border-subtle` | `#27272A` | Borders |

#### Landing Page Specific
| Token | Value |
|-------|-------|
| Background | `#000000` (pure black) |
| Surface | `#111111` |
| Border | `#262626` |
| Gradient | `#3b82f6` → `#8b5cf6` (blue to purple) |
| Text | `#EDEDED` / `#A1A1AA` |

### 2.2 Typography
- **Landing Page**: `Outfit` (display/headings), `Inter` (body)
- **Dashboard**: `Geist Variable` (all text)
- Heading size scale: `clamp(3rem, 5.5vw, 4.5rem)` → `2.5rem` → `2rem` → `1.25rem`
- Body: 14px base, 13px for secondary labels

### 2.3 Spacing & Shape
- Border radius: `0.625rem` (10px) base, `9999px` for pills/badges
- Card corner radius: `16px` (landing), `12px` (dashboard)
- Sidebar width: ~220px (collapsible to icon-only mode)

### 2.4 Animation
- Landing page: `fadeInUp` stagger animation on page load (0ms, 100ms, 200ms, 300ms, 400ms delays)
- Hover: `translateY(-2px)` on cards and buttons
- Feature cards: `box-shadow` depth on hover
- AI loading indicator: 3-dot bounce animation

---

## 3. Application Structure & Routing

```
/ (Landing Page — public)
/login (Auth Page — public)
/signup (Auth Page — public)
/auth/success (OAuth callback handler)

/dashboard (DashboardLayout — protected)
  /command-center (default home)
  /inbox
  /my-tasks
  /analytics
  /ai
  /settings/*
  /task/:taskId (Full task detail)

  /:teamSlug (Team Overview)
  /:teamSlug/tasks (Task Board for team)
  /:teamSlug/projects (Project Dashboard)
  /:teamSlug/projects/:projectId (Project Details)
  /:teamSlug/views (Views Page)

  /projects/:projectId (Task Board for project)
  /views/:viewId (Task Board for view)
```

---

## 4. Pages & Screens

---

### 4.1 Landing Page (`/`)

**Visual Style**: Pure black background (`#000000`), glassmorphism hero card, animated purple/blue glow blobs in background.

**Layout (top to bottom)**:

#### Navbar
- Sticky, frosted glass (`backdrop-blur`, `bg-background/95`)
- Left: TaskPulse logo (circular SVG icon + wordmark)
- Center: Navigation links — Product, Resources, Customers, Pricing, Now, Contact (unauthenticated) OR Dashboard, Workspaces, Pricing (authenticated)
- Right: "Log in" text link + "Sign up" rounded pill button (black bg, white text)

#### Hero Section
- Two-column layout (text left, stats card right)
- **Left**:
  - Small pill badge: `● AI-Powered Task Management` (pulsing blue dot)
  - H1: "Manage tasks at the **speed of thought**" — gradient text for last 3 words (blue→purple)
  - Subtitle: "TaskPulse uses AI to automatically prioritize, categorize, and score your tasks. Built for teams that ship fast."
  - Two CTA buttons: "Get Started — It's Free" (white/light pill, purple glow shadow) + "See Features" (dark pill, subtle border)
- **Right**:
  - Glassmorphism stats card with `backdrop-filter: blur(10px)`, dark border
  - 3 stats stacked vertically with horizontal dividers: **10x** Faster prioritization | **100%** Test coverage target | **∞** Free tier tasks

#### Features Section (`#features`)
- Section header: H2 "Everything you need to **ship faster**" + "View all features" link
- **6-card grid** (auto-fit, min 300px each):
  1. **AI-Powered Prioritization** — GIF of AI animation as icon
  2. **Real-Time Collaboration** — MP4 video autoplay as icon
  3. **Weekly AI Digests** — GIF as icon
  4. **Multi-Tenant Workspaces** — MP4 video as icon
  5. **Enterprise Security** — GIF as icon
  6. **Social Login** — GIF as icon
- Each card: dark `#111111` bg, `#262626` border, icon (50×50px rounded), title, description
- Hover: lift + deeper shadow

#### CTA Section
- Full-width glassmorphism card
- Left: H2 + subtitle
- Right: "Start Building Now" CTA button
- Top border: gradient line (transparent → purple → transparent)

#### Footer
- Simple 1-row: Logo left | Tech stack credit right
- Border top

---

### 4.2 Auth Page (`/login` & `/signup`)

**Visual Style**: Pure black (`#000000`) full-screen, centered content, minimal Linear-inspired design.

**Layout**: Centered column, max-width 380px

**Default View (Login/Signup chooser)**:
- TaskPulse logo (SVG, 40×40px) centered at top
- H1: "Log in to TaskPulse" / "Create your workspace"
- 3 auth buttons (rounded-full, full-width):
  1. **Continue with Google** — indigo background (`#5e6ad2`), Google icon
  2. **Continue with email** — dark bg (`#1a1a1a`), dark border
  3. **Continue with GitHub** — dark bg, GitHub icon
- Footer: ToS link + "Don't have an account? Sign up" / "Already have an account? Log in"

**Email View** (toggled by clicking "Continue with email"):
- H1: "Create your account" / "Log in to your account"
- Name field (signup only), Email field, Password field
- Dark input style: `bg-[#111111]`, `border-[#2a2a2a]`, focus glow in indigo `#5e6ad2`
- "Continue" submit button (same dark style)
- Error message: red text on `#ef4444/10` background with red border
- "Back to login" text link

---

### 4.3 Dashboard Layout (shell wrapping all `/dashboard/*` routes)

**Visual Style**: Two-column shell — collapsible sidebar left + main content area right.

**Shell Structure**:
```
[Sidebar 220px] | [Main Content — flex-1]
                    [CommandPalette overlay — Ctrl+K]
                    [AskAI floating panel — bottom-right]
                    [TaskDetailPanel slide-in drawer]
                    [Various creation modals]
```

**Global Overlays (always present)**:
- **Command Palette** (Ctrl+K): Full-screen modal with search
- **Ask AI Panel**: Floating bubble bottom-right, expands to panel
- **CreateTaskModal**, **CreateWorkspaceModal**, **CreateProjectModal**, **CreateViewModal**: Centered modals

---

### 4.4 Sidebar

**Visual Style**: Dark sidebar panel, Linear-inspired hierarchy.

**Structure (top to bottom)**:

**Header**:
- Workspace name button (avatar + name + chevron dropdown indicator)
- 3 icon buttons: Toggle sidebar | Search (Ctrl+K) | Create task (+)

**Scrollable Nav Area**:
- Primary nav: `Dashboard` (grid icon) | `Inbox` (with unread badge count)
- **"Your Teams" section** (collapsible):
  - Each workspace shown as colored dot (gradient) + name + chevron
  - When expanded, shows sub-nav: Projects | Tasks | Views
  - Each workspace has a unique gradient color (5 rotating colors)
- Secondary nav: `Analytics` | `AI Assistant` | `Activity`

**Footer**:
- `Settings` | `Help`

**Collapsed State**: Sidebar collapses to 0 width; a toggle button appears at top-left of main content to re-open it.

---

### 4.5 Command Center (`/dashboard/command-center`) — Home Dashboard

**Visual Style**: Content page with `--bg-base` background, max-width 7xl centered grid.

**Header Bar**:
- H1: Contextual greeting ("Good morning, [Name]!")
- Subtitle: "Here is what's happening in [Workspace] today."
- Right: "Invite Team" ghost button + "Create Task" indigo button

**12-column Grid Layout**:

**Row 1**:
- **AI Focus Panel** (span 8): White card with indigo glow blob. Lists top 3 AI-recommended tasks sorted by `ai.priority` score. Each task row shows: colored status dot, title, AI score badge (`Score: N`), urgency tag. Clicking opens task detail.
- **My Day** (span 4): Shows counts — Overdue (red badge) | Due Today (indigo badge) | Upcoming (muted). Empty state: green checkmark icon + "You're all caught up!"

**Row 2**:
- **Project Overview** (span 6): Lists up to 4 projects with name + progress bar. "View All" link.
- **Team Activity** (span 6): Chronological feed of task updates — avatar initials + "[Name] updated/completed task [title]" + relative time.

---

### 4.6 Inbox (`/dashboard/inbox`)

**Visual Style**: Notification feed, Linear-style.

**Header**: "Inbox" title + filter chips

**Filter Chips**: All | Unread | Mentions | Assignments | "Mark all as read" ghost button

**Notification List**: Grouped by time — Today | Yesterday | Earlier This Week | Older

Each notification item:
- Icon (context-specific: CheckCircle, User, Bell, MessageSquare, AlertCircle)
- Bold actor name + notification text + preview snippet
- Relative time (right-aligned)
- Unread state: highlighted background

Clicking navigates to the related task or project.

---

### 4.7 Task Board / My Tasks (`/dashboard/my-tasks`, `/:teamSlug/tasks`)

**Visual Style**: Linear-style grouped task list with optional side-peek panel.

**Filter Tabs**: All tasks | Active | Backlog

**Toolbar Icons** (top-right): Filter | Group by | Side peek toggle | Display/Layout toggle

**Task Groups**: Tasks grouped by status (Backlog → Todo → In Progress → Review → Done)

Each group:
- Collapsible header: group checkbox | chevron | Status badge (colored dot) | Status label | Task count | Add task (+) button
- Task rows underneath (collapsible)

Each TaskRow shows:
- Checkbox (appears on hover or when any task selected)
- Status badge dot
- Task title
- Priority indicator (AI score)
- Assignee avatar
- Due date

**Bulk Actions Bar** (appears when tasks selected):
- Floating bottom bar: "X tasks selected" + actions: Change Status | Assign | Set Priority | Delete | Clear

**Task Detail Panel** (Side Peek mode):
- Right-side drawer that slides in when side-peek is enabled
- Shows full task details without leaving the list

---

### 4.8 Project Dashboard (`/:teamSlug/projects`)

**Visual Style**: Card grid layout with project cards.

**Header**: "Projects" title + subtitle + "New Project" indigo button

**Project Cards** (3-column grid on large screens):
- Project name (H3)
- Status badge (color-coded: blue=in-progress, purple=review, green=done, gray=todo)
- Edit/Delete hover buttons (visible on card hover)
- 2-line summary description
- Progress bar (accent color fill)
- Member avatars (stacked, +N overflow)
- Task count

**FAB**: Floating `+` button at bottom-right

---

### 4.9 Project Details (`/:teamSlug/projects/:projectId`)

**Visual Style**: Full project view with tabs and view switcher.

**Top Bar**: Project name | Star button | Share | ... menu | View switcher (List / Kanban)

**List View**: Same as Task Board but filtered to project tasks

**Kanban View**: 4 columns — Todo | In Progress | Review | Done
- Drag-and-drop between columns (using @hello-pangea/dnd)
- Each task card: title, priority badge, due date (clock icon), assignee
- Priority colors: High (red), Medium (amber), Low (blue)

---

### 4.10 Analytics (`/dashboard/analytics`)

**Visual Style**: Executive dashboard with KPI cards + charts.

**Header**: "Executive Analytics" + workspace subtitle

**KPI Row** (4 cards):
1. Total Tasks — large number
2. Completed — accent colored number
3. Overdue — red number
4. AI Completion Rate — indigo, with light indigo background overlay

**Charts Row** (3-column):
- **Task Completion Trends** (span 2): Bar chart (CSS bars, 7 days), bar width fills on hover
- **AI Insights** (span 1): Gradient indigo card showing AI-generated weekly digest text, or "No digest available"

**Project Health Table**:
- Full-width table: Project | Lead (avatar) | Status (colored badge) | Progress (bar + %)

---

### 4.11 AI Assistant (`/dashboard/ai`)

**Visual Style**: Full-height chat interface.

**Header**: Sticky top bar — "TaskPulse AI" + subtitle

**Chat Area**: Scrollable, max-width 4xl centered
- AI messages: surface card, left-aligned, rounded-bl-none, indigo "TaskPulse AI" label
- User messages: accent bg, white text, right-aligned, rounded-br-none
- Loading state: 3-dot bounce animation (indigo dots)

**Input Area**: Sticky bottom bar
- Full-width rounded input with placeholder "Ask me to summarize tasks, prioritize work..."
- Send button (accent indigo, paper-plane icon)
- Disclaimer: "AI can make mistakes. Verify important information."

---

### 4.12 Settings (`/dashboard/settings`)

**Visual Style**: Linear-style settings layout — settings sidebar left + content right.

**Settings Sidebar**:
- "← Back to app" link
- Search input
- Grouped menu items:
  - **Personal**: Preferences | Profile | Notifications
  - **Issues**: Labels | Templates
  - **Features**: AI & Agents
  - **Administration**: Workspace | Members | Billing

**Active Content Panels**:

**Preferences**:
- Default home view (dropdown)
- Display names (dropdown)
- Enable AI task scoring (toggle)
- Interface theme (dropdown: Dark / System preference)
- Font size (dropdown)
- AI Weekly Digest (toggle)

**Profile** (`ProfileSection`): Avatar upload, name/email fields, save button

**Notifications** (`NotificationsSection`): Toggle switches per notification type

**Workspace** (`WorkspaceSection`): Workspace name, slug, description, delete option

**Billing** (`BillingSection`): Plan display, upgrade CTA, payment methods

---

### 4.13 Team Overview (`/:teamSlug`)

**Visual Style**: Team hub page, Linear team overview style.

**Top Bar**: Colored team avatar + Team name + Star button

**Tabs**: Overview | Documents | Members

**Overview Tab**:
- Team description
- Quick nav cards: Tasks | Projects | Views
- Recent activity feed

**Members Tab**: Member list with avatars, names, roles, joined date

---

### 4.14 Views Page (`/:teamSlug/views`)

**Visual Style**: Saved views management page.

**Header**: "Views" title + "New View" button

**View Cards**: Each saved view shows — icon, name, filter description, "Open" button

**Create View Modal**: Name + filter configuration

---

### 4.15 Task Detail (`/dashboard/task/:taskId`)

Full-page task detail view (separate route for deep linking from command palette).

Shows: title, description, status, priority, assignee, due date, project, workspace, comments section, AI analysis panel (AI score, urgency, reasoning).

---

## 5. Modal Components

### CreateTaskModal
- **Trigger**: Sidebar + button / Command Center "Create Task" / Status group header +
- **Style**: Centered modal, dark overlay
- **Fields**: Title, Description, Status (dropdown), Priority (dropdown), Due Date (date picker), Assignee
- **CTA**: "Create Task" indigo button

### CreateProjectModal
- **Fields**: Project name, Description, Status, Color/icon picker

### CreateWorkspaceModal
- **Fields**: Workspace name, Slug (auto-generated)

### CreateViewModal
- **Fields**: View name, View type, Filters

### InviteTeamModal
- **Fields**: Email input, Role selector
- **Action**: "Send Invite" — calls backend invite API

### EditProjectModal
- Same as CreateProjectModal but pre-filled with existing data

---

## 6. Global Components

### Command Palette (Ctrl+K)
- Full-screen modal overlay, dark background
- Search input at top
- Results grouped by: Recent | Tasks | Navigation
- Each task result: status dot, title, AI priority badge, assignee avatar
- Navigation items: Go to Inbox, My Tasks, Analytics, AI, Settings
- Keyboard navigable (↑↓ arrows, Enter to select)

### Ask AI Panel
- Floating button (bottom-right, indigo circle)
- Expands to a panel (no route change)
- Same chat UI as AIPage but in a side drawer

### TaskDetailPanel (Side Drawer)
- Slides in from the right
- Full task detail: title, description, status/priority/assignee selectors, due date, comments, AI analysis
- Close button (×)

---

## 7. Shared Components

| Component | Purpose |
|-----------|---------|
| `Avatar` | Circular avatar with initials fallback |
| `Breadcrumbs` | Page navigation trail |
| `EmptyState` | Centered icon + title + description + optional action button |
| `FilterBar` | Tab-strip for filtering (All / Active / Backlog etc.) |
| `TaskStatusBadge` | Colored dot indicator per status |
| `TaskPriorityBadge` | Color-coded priority label |
| `BulkActionBar` | Floating bottom bar for multi-select bulk actions |

---

## 8. Current Design Shortcomings (What to Improve)

> These are intentional pain points for Orchids AI to address in the redesign:

1. **Landing page has no product screenshots/mockups** — Only stats and feature descriptions. No actual UI previews which limits conversion.
2. **Dashboard lacks visual hierarchy** — The Command Center grid looks like a plain admin panel. Needs premium visual weight differentiators.
3. **Sidebar is functional but plain** — No hover states, no gradients on active items, workspace color dots are small. Compared to Linear or Notion, it lacks personality.
4. **Auth page is minimal** — Only 3 buttons on a black screen. Lacks any branding context, product value prop, or visual storytelling.
5. **Analytics has a fake bar chart** — The bar chart is hardcoded with mock data (`[40, 60, 45, 80, 50, 75, 90]`). No real charting library (no Recharts, no Chart.js). Needs proper chart components.
6. **No loading skeletons** — Pages either show "Loading..." text or are empty until data arrives. No skeleton shimmer animations.
7. **No dark/light mode toggle in UI** — The app has CSS variables for both but no toggle button in the settings or header for quick switching.
8. **Settings page is text-heavy and lacks visual interest** — Toggle switches are custom CSS but lack animation. Section icons are emojis, not proper SVG icons.
9. **Kanban board lacks visual depth** — Cards are plain, no color coding by priority on the card background, no task count in column headers.
10. **Mobile responsiveness is partial** — Landing page has media queries but the dashboard has none. The sidebar doesn't collapse on mobile.

---

## 9. User Flows

### New User Flow
1. Lands on `/` → reads hero + features
2. Clicks "Get Started — It's Free"
3. Redirected to `/login`
4. Clicks "Continue with Google" → OAuth redirect
5. Backend redirects to `/auth/success` with tokens
6. Frontend extracts tokens, stores them, navigates to `/dashboard`
7. `WorkspaceProvider` fetches workspaces; if none, a workspace is auto-created
8. User lands on `/dashboard/command-center`

### Create Task Flow
1. Click "+" in sidebar header OR "Create Task" in Command Center OR "+" in status group header
2. `CreateTaskModal` opens
3. Fill fields → Submit
4. Task POSTed to `/api/v1/tasks`
5. Workspace context refetches tasks
6. Task appears in relevant view

### Find Task Flow (Power User)
1. Press Ctrl+K
2. Command Palette opens
3. Type task name → debounced search hits `/api/v1/tasks?search=...`
4. Click result → `TaskDetailPanel` opens (or navigates to `/dashboard/task/:id`)

---

## 10. Context / State Architecture

| Context | Provides |
|---------|----------|
| `AuthContext` | `user`, `isAuthenticated`, `login()`, `register()`, `logout()` |
| `WorkspaceContext` | `workspaces`, `activeWorkspace`, `tasks`, `notifications`, `unreadCount`, `sidebarCollapsed` |
| `CommandPaletteContext` | `isOpen`, `open()`, `close()` |
| `RealTimeContext` | WebSocket connection (Socket.IO) for live task updates |

---

## 11. Key Design Tokens for the Redesign

When redesigning, ensure these CSS variables are preserved or updated globally:

```css
/* Dashboard shell */
--tp-bg: page background
--tp-surface: card/panel background
--tp-text: primary text
--tp-text-muted: secondary text
--tp-accent: #6366F1 (indigo) — all CTA buttons, active states
--tp-border-subtle: borders and dividers

/* Landing page */
Brand gradient: #3b82f6 → #8b5cf6 (blue to purple)
Glow: rgba(139, 92, 246, 0.4)
Background: #000000
Surface: #111111
```
