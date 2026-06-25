# TaskPulse Frontend — Linear-Style UI Implementation Plan

> Rebuild the TaskPulse dashboard frontend to match Linear.app's UI patterns, adapted for TaskPulse's domain (workspaces, tasks, AI scoring, analytics).

---

## Linear.app UI Analysis (from live dashboard exploration)

### Screenshots Reference

````carousel
![Linear Main Dashboard — Issues list with sidebar, breadcrumbs, status groups, and filter tabs](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/main_default_1781773489441.png)
<!-- slide -->
![Linear Sidebar — Full navigation with workspace switcher, sections, team tree](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/sidebar_full_1781773492796.png)
<!-- slide -->
![Linear My Issues — Tabs for Assigned/Created/Subscribed/Activity, empty state](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/my_issues_view_1781773506397.png)
<!-- slide -->
![Linear Inbox — Split-pane with notification list on left, detail on right](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/inbox_view_1781773527222.png)
<!-- slide -->
![Linear Issue Detail — Full-page with title, description, video embed, right sidebar properties](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/issue_detail_1781773575685.png)
<!-- slide -->
![Linear Command Palette — Modal overlay with search, quick actions, keyboard shortcuts](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/command_palette_1781773586889.png)
<!-- slide -->
![Linear Projects — Empty state with illustration, CTA button](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/projects_view_1781773550344.png)
<!-- slide -->
![Linear Settings — Sidebar categories, preferences form with toggles and dropdowns](C:/Users/Harish/.gemini/antigravity-ide/brain/e45cf8e1-80f1-4885-a4f4-5278bd76811d/settings_view_1781773685859.png)
````

### Key UI Patterns Observed

| Pattern | Linear Implementation | TaskPulse Adaptation |
|---------|----------------------|---------------------|
| **Layout** | 3-column: Sidebar (200px) + Main Content + Optional Right Panel | Same — sidebar + main + context panel |
| **Theme** | Light mode default, warm off-white bg (`#F8F7F5`~), subtle sidebar tint | **Dark mode** by default (our existing `--lin-bg: #0a0a0a`) — differentiate from Linear |
| **Sidebar** | Collapsible, ~200px, workspace switcher at top, sectioned nav | Same structure, TaskPulse branding |
| **Breadcrumbs** | `Team → Issues → HAR-1 Title` in top bar | `Workspace → Tasks → TP-1 Title` |
| **Issue List** | Grouped by status, rows with: `···` menu, `HAR-1` ID, status icon, title, assignee, date | Same — grouped by status, task rows |
| **Filter Tabs** | Pill-style tabs: `All issues` / `Active` / `Backlog` | `All Tasks` / `Active` / `Review` / `Done` |
| **Issue Detail** | Full-page view with right sidebar for properties (status, priority, assignee, labels, project) | Full-page with AI Score section in right sidebar |
| **Command Palette** | `Ctrl+K` modal: search + quick actions with keyboard shortcuts | Same — adapted for TaskPulse actions |
| **Inbox** | Split pane — notification list left, detail right | Same pattern |
| **Settings** | Full-page with sidebar categories (Personal, Issues, Projects, Features, Admin) | Same — adapted for TaskPulse settings |
| **Empty States** | Centered illustration + description + CTA button | Same pattern with TaskPulse branding |
| **"Ask Linear"** | AI chat button in bottom-right corner | **"Ask TaskPulse AI"** — prominent feature |
| **Bottom-right** | `Ask Linear` button + Settings gear | `Ask TaskPulse AI` + Settings gear |

---

## Proposed Route & Page Structure

```
/dashboard                     → Redirects to /dashboard/inbox or /dashboard/my-tasks
/dashboard/inbox               → Inbox (notifications)
/dashboard/my-tasks            → My Tasks (assigned to me)
/dashboard/projects            → Projects list
/dashboard/views               → Custom views
/dashboard/analytics           → Analytics dashboard (TaskPulse-specific)

/dashboard/:teamSlug/tasks     → Team task list (filtered by workspace)
/dashboard/:teamSlug/projects  → Team projects
/dashboard/:teamSlug/views     → Team views

/dashboard/task/:taskId        → Task detail page
/dashboard/settings/*          → Settings (nested routes)
```

---

## Proposed File Structure

```
src/
├── App.jsx                          ← Route definitions
├── index.css                        ← Global styles + Tailwind
├── main.jsx                         ← Entry point
│
├── layouts/
│   └── DashboardLayout.jsx          ← [NEW] Sidebar + main area shell
│
├── components/
│   ├── LandingPage.jsx              ← [KEEP]
│   ├── LandingPage.css              ← [KEEP]
│   ├── AuthPage.jsx                 ← [KEEP]
│   ├── Navbar.jsx                   ← [KEEP]
│   ├── Navbar.css                   ← [KEEP]
│   │
│   ├── sidebar/
│   │   ├── Sidebar.jsx              ← [NEW] Full sidebar component
│   │   ├── Sidebar.css              ← [NEW]
│   │   ├── WorkspaceSwitcher.jsx    ← [NEW] Top workspace avatar + name dropdown
│   │   ├── SidebarNav.jsx           ← [NEW] Navigation items (Inbox, My Tasks, etc.)
│   │   └── TeamTree.jsx             ← [NEW] Collapsible team/workspace tree
│   │
│   ├── tasks/
│   │   ├── TaskList.jsx             ← [NEW] Issue-list with status grouping
│   │   ├── TaskList.css             ← [NEW]
│   │   ├── TaskRow.jsx              ← [NEW] Single task row (ID, status icon, title, meta)
│   │   ├── TaskDetail.jsx           ← [NEW] Full-page task detail view
│   │   ├── TaskDetail.css           ← [NEW]
│   │   ├── TaskProperties.jsx       ← [NEW] Right-sidebar: status, priority, assignee, AI score
│   │   ├── TaskStatusBadge.jsx      ← [NEW] Status circle icon (todo, in-progress, done)
│   │   ├── TaskPriorityBadge.jsx    ← [NEW] Priority indicator
│   │   └── CreateTaskModal.jsx      ← [NEW] Modal for creating new tasks
│   │
│   ├── inbox/
│   │   ├── Inbox.jsx                ← [NEW] Split-pane inbox
│   │   └── Inbox.css                ← [NEW]
│   │
│   ├── projects/
│   │   ├── ProjectList.jsx          ← [NEW] Projects grid/list
│   │   └── ProjectList.css          ← [NEW]
│   │
│   ├── analytics/
│   │   ├── AnalyticsDashboard.jsx   ← [NEW] Charts + AI digest summary
│   │   └── AnalyticsDashboard.css   ← [NEW]
│   │
│   ├── command-palette/
│   │   ├── CommandPalette.jsx       ← [NEW] Ctrl+K command palette modal
│   │   └── CommandPalette.css       ← [NEW]
│   │
│   ├── ai/
│   │   ├── AskAIPanel.jsx           ← [NEW] Bottom-right AI chat panel
│   │   └── AskAIPanel.css           ← [NEW]
│   │
│   ├── settings/
│   │   ├── SettingsLayout.jsx       ← [NEW] Settings page with sidebar nav
│   │   ├── SettingsLayout.css       ← [NEW]
│   │   ├── PreferencesPage.jsx      ← [NEW]
│   │   ├── ProfilePage.jsx          ← [NEW]
│   │   ├── WorkspaceSettingsPage.jsx← [NEW]
│   │   └── MembersPage.jsx          ← [NEW]
│   │
│   ├── shared/
│   │   ├── EmptyState.jsx           ← [NEW] Reusable empty state (illustration + CTA)
│   │   ├── FilterBar.jsx            ← [NEW] Tab-style filter pills
│   │   ├── Breadcrumbs.jsx          ← [NEW] Path breadcrumbs in top bar
│   │   ├── TopBar.jsx               ← [NEW] Main content header bar
│   │   ├── Avatar.jsx               ← [NEW] User/team avatar component
│   │   ├── Tooltip.jsx              ← [NEW] Hover tooltips
│   │   └── Toast.jsx                ← [NEW] Notification toasts
│   │
│   └── ui/                          ← [KEEP] Existing shadcn components
│
├── pages/
│   ├── AuthSuccessPage.jsx          ← [KEEP]
│   └── DashboardPage.jsx            ← [REPLACE] → Becomes thin wrapper using DashboardLayout
│
├── context/
│   ├── AuthContext.jsx              ← [KEEP]
│   ├── WorkspaceContext.jsx         ← [NEW] Active workspace state
│   └── CommandPaletteContext.jsx    ← [NEW] Ctrl+K open/close state
│
├── hooks/
│   ├── useKeyboardShortcuts.js      ← [NEW] Global keyboard shortcut handler
│   └── useMediaQuery.js             ← [NEW] Responsive breakpoints
│
├── api/
│   └── client.js                    ← [KEEP]
│
└── assets/
    └── ...                          ← [KEEP]
```

---

## Proposed Changes — Phased Approach

### Phase 1: Dashboard Shell & Sidebar (Foundation)

> [!IMPORTANT]  
> This is the most critical phase — it sets up the layout skeleton that all other views plug into.

#### [NEW] [DashboardLayout.jsx](file:///d:/SaaS/sample/sample-design/src/layouts/DashboardLayout.jsx)
- Full-height flex layout: `Sidebar` (left) + `Outlet` (main content)
- Handles sidebar collapse/expand state
- Provides `WorkspaceContext` to all children
- Renders `CommandPalette` overlay
- Renders `AskAIPanel` in bottom-right corner

#### [NEW] [Sidebar.jsx](file:///d:/SaaS/sample/sample-design/src/components/sidebar/Sidebar.jsx)
Replicating Linear's exact sidebar structure:
1. **Header**: Workspace avatar + name + dropdown chevron | Search icon | Create (+) icon
2. **Primary Nav**: Inbox (with unread badge), Reviews, My Tasks
3. **Workspace Section** (collapsible): Projects, Views, More
4. **Your Teams Section** (collapsible): Team name → Issues, Projects, Views (nested tree)
5. **Try/Quick Actions Section**: Import, Invite people, etc.
6. **Footer**: Help (?) icon

#### [MODIFY] [App.jsx](file:///d:/SaaS/sample/sample-design/src/App.jsx)
- Add nested routes under `/dashboard` using `DashboardLayout` as parent
- Each view (inbox, my-tasks, tasks, etc.) becomes a child route

---

### Phase 2: Task List & Task Detail (Core Views)

#### [NEW] [TaskList.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskList.jsx)
Replicating Linear's issues list:
- **Filter tabs** at top: `All Tasks` | `Active` | `Backlog` (pill-style, like Linear's)
- **Status group headers**: `○ Todo 4` — expandable/collapsible groups
- **Task rows**: `··· HAR-1 ○ Task Title ... assignee avatar  Jun 14`
  - Left: context menu dots, task ID, status icon, title
  - Right: assignee avatar, date, AI priority badge (TaskPulse-specific)
- **Right-side controls**: Filter icon, Group-by icon, Layout toggle
- Top `+` button to add new task

#### [NEW] [TaskDetail.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskDetail.jsx)
Replicating Linear's issue detail:
- **Breadcrumbs**: `Team → Tasks → TP-1 Task Title ☆ ···`
- **Main content**: Title (editable), description (rich text area), comments
- **Right sidebar panel** (`TaskProperties.jsx`):
  - Properties section: Status, Priority (manual), Assignee
  - AI Score section (TaskPulse-specific): AI Priority (0-10), Urgency badge, Category, Reasoning
  - Labels section
  - Project section
  - Due date
- **Navigation**: `1/4 ↓ ↑` issue counter + prev/next arrows (top-right)

#### [NEW] [CreateTaskModal.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/CreateTaskModal.jsx)
- Modal dialog for creating new tasks
- Fields: Title, Description, Status, Priority, Assignee, Due Date
- AI scoring indicator showing "AI will score this task"

---

### Phase 3: Inbox & Notifications

#### [NEW] [Inbox.jsx](file:///d:/SaaS/sample/sample-design/src/components/inbox/Inbox.jsx)
Replicating Linear's inbox:
- **Split pane**: Notification list (left ~30%) + Detail preview (right ~70%)
- Notification items: icon + title + preview text + timestamp
- Empty state: illustration + "No unread notifications"
- Filter/settings icons in header

---

### Phase 4: Command Palette & Keyboard Shortcuts

#### [NEW] [CommandPalette.jsx](file:///d:/SaaS/sample/sample-design/src/components/command-palette/CommandPalette.jsx)
Replicating Linear's `Ctrl+K`:
- **Context header**: Shows current context (e.g., `TP-1 · Task Title`)
- **Search input**: "Type a command or search..." with `Ask TaskPulse AI` and `Tab` hints
- **Quick actions** with keyboard shortcuts:
  - `Assign to...` (A)
  - `Assign to me` (I)
  - `Change status...` (S)
  - `Set priority...` (P)
  - `Add to project...` (⌘P)
  - `Add labels...` (L)
  - `Set due date...` (⌘D)
  - `Copy task ID` (Ctrl+.)

---

### Phase 5: Analytics & AI Features (TaskPulse Differentiators)

#### [NEW] [AnalyticsDashboard.jsx](file:///d:/SaaS/sample/sample-design/src/components/analytics/AnalyticsDashboard.jsx)
- Dashboard with charts: tasks completed over time, priority distribution
- AI Weekly Digest card: summary from the last AI-generated digest
- Metrics cards: total tasks, completed, overdue, avg AI priority

#### [NEW] [AskAIPanel.jsx](file:///d:/SaaS/sample/sample-design/src/components/ai/AskAIPanel.jsx)
- Floating "Ask TaskPulse AI" button in bottom-right (like Linear's "Ask Linear")
- Expandable chat panel with conversation UI
- Can ask about tasks, get summaries, task suggestions

---

### Phase 6: Projects & Settings

#### [NEW] [ProjectList.jsx](file:///d:/SaaS/sample/sample-design/src/components/projects/ProjectList.jsx)
- Projects grid with cards or list view
- Empty state: illustration + "Create new project" CTA
- Filter tabs: `All projects`

#### [NEW] [SettingsLayout.jsx](file:///d:/SaaS/sample/sample-design/src/components/settings/SettingsLayout.jsx)
Replicating Linear's settings structure:
- **Sidebar categories**: Personal (Preferences, Profile, Notifications) → Issues (Labels, Templates) → Features (AI & Agents) → Administration (Workspace, Members, Billing)
- **Main content**: Forms with toggles, dropdowns, text inputs
- Back to app link at top

---

## Design System — Dark Theme (Differentiator from Linear)

> [!NOTE]
> Linear uses a light theme by default. TaskPulse will use a **dark theme** to visually differentiate while keeping the same structural patterns.

```css
/* TaskPulse Design Tokens */
:root {
  /* Backgrounds */
  --tp-bg:              #09090b;      /* Main background */
  --tp-sidebar-bg:      #0c0c0e;      /* Sidebar background */
  --tp-surface:         #141416;      /* Cards, panels */
  --tp-surface-hover:   #1a1a1e;      /* Hover states */
  --tp-surface-active:  #1f1f24;      /* Active/selected states */

  /* Borders */
  --tp-border:          #27272a;      /* Primary borders */
  --tp-border-subtle:   #1e1e22;      /* Subtle dividers */

  /* Text */
  --tp-text:            #fafafa;      /* Primary text */
  --tp-text-secondary:  #a1a1aa;      /* Secondary text */
  --tp-text-muted:      #52525b;      /* Muted/placeholder text */

  /* Accent (Linear-inspired indigo) */
  --tp-accent:          #6366f1;      /* Primary accent */
  --tp-accent-hover:    #818cf8;      /* Accent hover */
  --tp-accent-muted:    rgba(99, 102, 241, 0.15); /* Accent background */

  /* Status colors */
  --tp-todo:            #a1a1aa;      /* Todo - gray */
  --tp-in-progress:     #f59e0b;      /* In Progress - amber */
  --tp-review:          #3b82f6;      /* Review - blue */
  --tp-done:            #22c55e;      /* Done - green */

  /* Priority colors */
  --tp-urgent:          #ef4444;      /* Urgent/Critical */
  --tp-high:            #f97316;      /* High */
  --tp-medium:          #f59e0b;      /* Medium */
  --tp-low:             #6366f1;      /* Low */
  --tp-none:            #52525b;      /* No priority */

  /* AI feature accent */
  --tp-ai:              #a855f7;      /* AI purple */
  --tp-ai-hover:        #c084fc;
  --tp-ai-muted:        rgba(168, 85, 247, 0.12);

  /* Typography */
  --tp-font:            'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Sizing */
  --tp-sidebar-width:   240px;
  --tp-sidebar-collapsed: 48px;
}
```

---

## User Review Required

> [!IMPORTANT]
> **Theme Choice**: I've proposed a **dark theme** to differentiate from Linear (which uses light). Your existing dashboard already uses dark colors. Should we:
> - A) Keep dark-only (current approach)
> - B) Support both light/dark with a toggle (more work)

> [!IMPORTANT]
> **Routing**: The plan uses nested routes under `/dashboard/*`. This means the URL structure changes from the current single `/dashboard` route. Is this acceptable?

## Open Questions

> [!WARNING]
> **TailwindCSS vs Vanilla CSS**: Your existing DashboardPage uses vanilla CSS (`.dashboard-shell`, `.sidebar`, etc.) but AuthPage uses Tailwind classes. The project has both Tailwind and vanilla CSS. Which approach should we standardize on?
> - The current DashboardPage.css has well-structured Linear-style CSS variables — I'd recommend **keeping vanilla CSS for the dashboard** since it provides more precise control for this Linear-style UI.
> - Tailwind can still be used for utility needs and the landing/auth pages.

> [!NOTE]
> **Phase Execution**: I recommend building **Phase 1 (Shell + Sidebar) and Phase 2 (Task List + Detail)** first, as they form the core structure. Phases 3–6 can be added incrementally. Want me to start with Phase 1?

---

## Verification Plan

### Manual Verification
- Visual comparison of each view against Linear screenshots
- Test sidebar collapse/expand
- Test all navigation routes
- Test command palette (Ctrl+K)
- Test responsive behavior on mobile
- Verify all interactive states (hover, active, focus)

### Automated Tests
```bash
npm run build  # Verify no build errors
npm run lint   # Code quality check
```

### Browser Testing
- Open the dev server and walk through every route
- Take comparison screenshots alongside the Linear reference images
