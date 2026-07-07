# TaskPulse — Claude-Opus Agent Prompts
# Copy each prompt block into your Antigravity agent session

---

## SHARED CONTEXT BLOCK
> Paste this at the start of every session before sending any prompt below.

```
PROJECT: TaskPulse — an AI-powered multi-tenant SaaS task management application.

TECH STACK:
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Tremor
- Component library: shadcn/ui (https://ui.shadcn.com) — already installed
- Charts: Tremor (https://tremor.so) — already installed
- State: React state + Context API (no Redux)
- Auth: JWT tokens stored in localStorage as "accessToken" and "refreshToken"
- HTTP: fetch() with a shared apiClient wrapper that injects Authorization header
- Backend: Node.js + Express + MongoDB + Redis (already built and running)

API BASE URL: http://localhost:3000/api/v1

AUTH HEADER: Every API call must include:
  Authorization: Bearer ${localStorage.getItem('accessToken')}

ERROR HANDLING: All API calls should catch errors and show a toast notification.
LOADING STATES: All async operations need a loading skeleton or spinner.
DARK MODE: All components must support dark mode via Tailwind's "dark:" prefix.
TOASTS: Use shadcn/ui Sonner or Toast for all success/error notifications.
```

---

## PROMPT 1 — Landing Page Navbar with Sections and Docs

```
CONTEXT: [paste shared context block above]

TASK: Build the landing page navbar and page sections for TaskPulse.

REQUIREMENTS:

NAVBAR (sticky, top-0, z-50):
- Left: TaskPulse logo (icon + bold text)
- Centre: Navigation links — Features | How It Works | Pricing | Documentation
- Right: "Log in" (ghost button) and "Get Started Free" (solid primary button)
- Each nav link smooth-scrolls to its section on the same page using href="#section-id"
- On scroll past 60px, add a subtle backdrop-blur and border-bottom to the navbar
- MOBILE (< 768px): hide centre links and right buttons, show a hamburger icon
  - Clicking hamburger opens a shadcn Sheet from the right with all nav links stacked
  - Sheet includes "Log in" and "Get Started Free" at the bottom

LANDING PAGE SECTIONS (in order, each has an id for anchor scroll):

1. HERO (id="hero")
   - Large headline: "AI that prioritises your team's work — automatically"
   - Subheadline: "TaskPulse scores every task by urgency, category and deadline using AI. Your team always knows what to do next."
   - Two CTAs: "Get Started Free" (primary) and "See how it works" (ghost, scrolls to #how-it-works)
   - Below CTAs: three trust badges — "No credit card required" · "Setup in 5 minutes" · "Free forever plan"

2. FEATURES (id="features")
   - Section title: "Everything your team needs"
   - Six feature cards in a 3×2 grid. Each card: icon (Tabler), title, one-sentence description.
     Card 1: ti-robot     | AI task scoring       | Every task gets a priority score and suggested deadline automatically.
     Card 2: ti-bolt      | Real-time updates     | Changes sync instantly to every teammate via WebSocket.
     Card 3: ti-shield    | Rate-limited AI       | Fair usage with a built-in 100 req/day free tier and Pro upgrade.
     Card 4: ti-chart-bar | Usage analytics       | Track completion rates, overdue trends, and team velocity.
     Card 5: ti-mail      | Weekly AI digest      | A personalised summary emailed to your team every Monday.
     Card 6: ti-building  | Multi-tenant workspaces | Invite your team, manage roles, keep projects isolated.

3. HOW IT WORKS (id="how-it-works")
   - Section title: "Up and running in three steps"
   - Three steps in a horizontal row, connected by a dashed line:
     Step 1: Create a workspace and invite your team
     Step 2: Add tasks — AI scores and prioritises them instantly
     Step 3: Track progress with real-time updates and weekly digests

4. PRICING (id="pricing")
   - Section title: "Simple pricing"
   - Two cards side by side: Free and Pro
   - Free: $0/month — 1 workspace, 100 AI requests/day, 3 members, basic analytics
   - Pro: $12/month — Unlimited workspaces, 10,000 AI requests/day, unlimited members, full analytics + weekly digest
   - Pro card has a "Most popular" badge and a highlighted border

5. DOCUMENTATION (id="docs")
   - Section title: "Get started in minutes"
   - shadcn Accordion with 6 FAQ items:
     Q: "How does AI task scoring work?" A: "When you create a task, TaskPulse sends the title and description to an AI model via OpenRouter. The model returns a priority score (1–10), urgency level, suggested deadline, and reasoning. This happens automatically on every task creation."
     Q: "Is my data private?" A: "Yes. Each workspace is fully isolated. Users can only access data from workspaces they are members of. AI requests do not retain your task data after processing."
     Q: "What happens when I hit the AI rate limit?" A: "The API returns a 429 response with a Retry-After header. The dashboard shows a banner with remaining requests and an upgrade option. Tasks can still be created manually without AI scoring."
     Q: "How do real-time updates work?" A: "TaskPulse uses WebSocket connections scoped to your workspace. When any team member creates or updates a task, all connected members receive the update instantly without refreshing."
     Q: "Can I invite my team?" A: "Yes. From any workspace, click Invite Members, enter email addresses, and send invites. Recipients get a unique link that adds them to the workspace when clicked."
     Q: "How do I export my data?" A: "The analytics endpoint supports JSON export. Pro plan includes CSV export from the analytics dashboard. Data can also be accessed via the public API with your workspace API key."

FOOTER:
- Left: Logo + tagline "AI-powered task management for modern teams"
- Right: Links — Privacy Policy · Terms of Service · GitHub · Contact
- Bottom: © 2024 TaskPulse. All rights reserved.

COMPONENTS TO USE:
- shadcn/ui: NavigationMenu, Sheet, Button, Accordion, Card, Badge
- All sections: max-w-6xl mx-auto px-6 container
- Smooth scroll: add scroll-smooth to <html>

ACCEPTANCE CRITERIA:
- [ ] Navbar is sticky and adds blur/border on scroll
- [ ] All 5 nav links scroll to their sections
- [ ] Mobile hamburger opens Sheet with all links
- [ ] All 5 landing sections render with correct content
- [ ] Accordion FAQ works (expand/collapse)
- [ ] "Get Started Free" links to /signup or /dashboard
- [ ] Dark mode works on all sections
```

---

## PROMPT 2 — Dynamic Workspace Dropdown

```
CONTEXT: [paste shared context block above]

TASK: Replace the static workspace selector in the sidebar/navbar with a fully dynamic dropdown.

CURRENT STATE: The workspace dropdown shows a hardcoded workspace name and does not fetch from the API.

REQUIREMENTS:

ON MOUNT:
- Call GET /api/v1/workspaces with Authorization header
- Store workspaces in React state
- Show a Skeleton placeholder while loading (match the size of the dropdown trigger)
- If fetch fails, show an error toast and display "Failed to load workspaces"

DROPDOWN TRIGGER (visible in sidebar):
- Shows initials avatar (first letter of workspace name, coloured by hash of name) + workspace name
- ChevronDown icon on the right
- Uses shadcn DropdownMenuTrigger

DROPDOWN CONTENT:
- Section label: "Your workspaces" (muted, small)
- List of workspaces from API:
  - Each item: initials avatar (coloured circle) + workspace name
  - Active workspace has a checkmark on the right
  - Clicking a workspace: set it as activeWorkspace in context, close dropdown, re-fetch dashboard data scoped to new workspaceId
- Divider
- "Create new workspace" item with a ti-plus icon
  - Clicking opens a Dialog (modal) with a form: workspace name (Input) + timezone (Select)
  - On submit: POST /api/v1/workspaces { name, timezone }
  - On success: add to workspaces list, set as active, show success toast, close dialog

WORKSPACE CONTEXT:
- Create a WorkspaceContext (useWorkspace hook) that stores:
  - workspaces: Workspace[]
  - activeWorkspace: Workspace | null
  - setActiveWorkspace: (ws: Workspace) => void
  - refreshWorkspaces: () => Promise<void>
- Wrap the app in <WorkspaceProvider>
- All dashboard data fetches should use activeWorkspace.id as the workspaceId

AVATAR COLOUR LOGIC:
- Hash the workspace name to pick one of 6 background colours (blue, teal, purple, amber, green, coral)
- Always the same colour for the same name (deterministic)

COMPONENTS:
- shadcn/ui: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Dialog, DialogContent, DialogHeader, Input, Select, Button, Skeleton, Avatar, AvatarFallback

API ENDPOINTS:
- GET  /api/v1/workspaces           → { data: Workspace[] }
- POST /api/v1/workspaces           → { workspace: Workspace }
  Body: { name: string, timezone: string }

TYPES:
interface Workspace {
  id: string
  name: string
  timezone: string
  createdBy: string
  members: { userId: string; role: string }[]
}

ACCEPTANCE CRITERIA:
- [ ] Workspace list fetches from API on mount
- [ ] Skeleton shows while loading
- [ ] Clicking a workspace switches the active context
- [ ] Dashboard re-fetches with new workspaceId when workspace switches
- [ ] Create workspace dialog works and adds to list
- [ ] Avatar colour is consistent per workspace name
- [ ] Error toast shown on API failure
- [ ] Works in dark mode
```

---

## PROMPT 3 — Dynamic Command-Palette Search

```
CONTEXT: [paste shared context block above]

TASK: Build a keyboard-driven command palette search that searches tasks in real time.

TRIGGER:
- Keyboard shortcut: Cmd+K on Mac, Ctrl+K on Windows/Linux
- Also a search bar in the top navbar: clicking it opens the same palette
- Use useEffect + keydown event listener to detect the shortcut globally

PALETTE BEHAVIOUR:
- Uses shadcn/ui Command inside a Dialog
- Opens as a centred modal overlay
- Input is auto-focused when opened
- Press Escape to close

SEARCH LOGIC:
- On each keystroke: debounce 300ms then call:
  GET /api/v1/tasks?search={query}&limit=8&workspaceId={activeWorkspace.id}
- Show a loading spinner inside the Command while fetching
- When query is empty: show recent tasks (last 5 from localStorage key "recentTasks")
  or a placeholder "Search tasks, members..."
- When query has results: show them grouped by status
- When no results: show "No tasks found for '{query}'"

RESULT ITEM (each task):
- Left: status dot (colour by status: todo=gray, in-progress=blue, review=amber, done=green)
- Middle: task title (bold), workspace name below in muted text
- Right: AI priority badge (1-10, coloured: 1-3=green, 4-6=amber, 7-10=red)
- Hovering/arrowing highlights item with background
- Pressing Enter or clicking: close palette, open task edit drawer (Prompt 8) with that task

RECENT TASKS:
- When a user opens a task from the search, save its id + title to localStorage "recentTasks" (max 5)
- Show recent tasks when query is empty with a "Recent" section label

KEYBOARD NAVIGATION:
- Arrow up/down moves highlight through results
- Enter opens selected task
- Cmd+K again or Escape closes
- Tab moves to next result

COMPONENTS:
- shadcn/ui: Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, Dialog, DialogContent, Badge

API:
- GET /api/v1/tasks?search={q}&limit=8&workspaceId={id}
  Response: { data: Task[], total: number }

ACCEPTANCE CRITERIA:
- [ ] Cmd+K / Ctrl+K opens the palette from any page
- [ ] Search is debounced (no API call on every keystroke)
- [ ] Results show status dot, title, workspace, priority badge
- [ ] Keyboard navigation works (arrows + Enter)
- [ ] Recent tasks shown when query is empty
- [ ] Selecting a task opens task edit drawer
- [ ] Escape closes palette
- [ ] Works in dark mode
```

---

## PROMPT 4 — Inbox with Task Completion Checkboxes

```
CONTEXT: [paste shared context block above]

TASK: Build the Inbox page that shows tasks assigned to the current user, with checkboxes to mark tasks done.

PAGE LAYOUT:
- Header: "Inbox" title + task count badge (e.g. "12 tasks")
- Three tabs: All · Today · This week (shadcn Tabs)
- Task list below

FETCH LOGIC:
- On mount and on workspace switch: call
  GET /api/v1/tasks?assignedTo=me&workspaceId={id}&status=todo,in-progress,review
- "Today" tab: add &dueDate=today query param
- "This week" tab: add &dueDate=this-week query param
- Show Skeleton rows (3) while loading

TASK ROW:
Each task is a horizontal row containing:
- Left: shadcn Checkbox (unchecked = not done)
- Middle:
  - Task title (line-through + muted when checked)
  - Below: workspace name · due date (if set, red if overdue) · AI category badge
- Right:
  - Priority badge (number, colour-coded: 1-3 green, 4-6 amber, 7-10 red)
  - Clicking the row (not the checkbox) opens task edit drawer (Prompt 8)

CHECKBOX BEHAVIOUR (optimistic update pattern):
1. User clicks checkbox → immediately apply visual done state (title strikes through, row fades)
2. Call PATCH /api/v1/tasks/:id { status: "done" }
3. On success: show success toast "Task marked as done" + remove row after 600ms animation
4. On error: revert checkbox to unchecked + show error toast "Failed to update task"

EMPTY STATE:
- When no tasks: show a centred illustration (Tabler icon ti-circle-check at 48px + "All caught up!" message)
- When "Today" tab has no tasks: "Nothing due today"

SORTING:
- Default sort: priority desc (highest first)
- Show tasks sorted by AI priority score

COMPONENTS:
- shadcn/ui: Checkbox, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton, Card
- Sonner / Toast for notifications

API:
- GET /api/v1/tasks?assignedTo=me&workspaceId=:id&status=todo,in-progress
  Response: { data: Task[], total: number }
- PATCH /api/v1/tasks/:id   Body: { status: "done" }

TYPES:
interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "review" | "done"
  workspaceId: string
  assignedTo: string
  dueDate?: string
  ai: { priority: number; urgency: string; category: string }
  createdAt: string
}

ACCEPTANCE CRITERIA:
- [ ] Inbox fetches tasks assigned to logged-in user
- [ ] Three tabs filter by due date
- [ ] Checkbox triggers optimistic update
- [ ] PATCH call updates backend
- [ ] Row animates out after check
- [ ] Error reverts checkbox state
- [ ] Empty state shown when list is empty
- [ ] Skeleton shows while loading
```

---

## PROMPT 5 — Projects Page with Dynamic Filters

```
CONTEXT: [paste shared context block above]

TASK: Make the Projects page fully dynamic with working filters, two views, and real-time filter chips.

FILTER BAR (above the task list):
Five filters, all in one horizontal bar:
1. Status: shadcn multi-select or Select with options: All · Todo · In Progress · Review · Done
2. Priority: Select — Any · High (7-10) · Medium (4-6) · Low (1-3)
3. Category: Select — Any · Bug · Feature · Chore · Research
4. Assignee: Select populated from GET /workspaces/:id/members
5. Date range: shadcn DateRangePicker (from/to dates)

"Clear all" button on the right — resets all filters

ACTIVE FILTER CHIPS:
Below the filter bar, show a chip for each active filter:
- Example: [Status: In Progress ×] [Priority: High ×] [Riya ×]
- Clicking × on a chip removes that filter and re-fetches

VIEW TOGGLE:
- Top right: two buttons — List view (ti-list) and Kanban view (ti-layout-kanban)
- Default: Kanban

KANBAN VIEW:
- Four columns: Todo · In Progress · Review · Done
- Each column shows a count badge + task cards
- Task card: title, AI priority badge, category badge, assignee avatar, due date
- Clicking a card opens task edit drawer (Prompt 8)

LIST VIEW:
- Table with columns: Checkbox · Title · Status · Priority · Category · Assignee · Due Date · Actions
- Actions: Edit (opens drawer) + Delete (confirm then call DELETE /tasks/:id)
- Sortable headers: click column header to sort

FETCH LOGIC:
- On filter change (any filter): rebuild query string and call:
  GET /api/v1/tasks?workspaceId=:id&status=:s&category=:c&priority=:p&assignedTo=:a&from=:d1&to=:d2
- Debounce 200ms to avoid rapid calls
- Show Skeleton while loading

EMPTY STATE:
- "No tasks match your filters" with a "Clear filters" button

PAGINATION:
- Load 20 tasks per page
- "Load more" button at the bottom (not infinite scroll)

COMPONENTS:
- shadcn/ui: Select, DateRangePicker, Calendar, Popover, Badge, Button, Skeleton, Table, Checkbox, DropdownMenu (for row actions)
- Tabler icons for column headers

API:
- GET /api/v1/tasks?workspaceId=:id&status=&category=&priority=&assignedTo=&limit=20&offset=0
- GET /api/v1/workspaces/:id/members (for assignee dropdown)
- DELETE /api/v1/tasks/:id

ACCEPTANCE CRITERIA:
- [ ] All five filters work and pass correct query params
- [ ] Active filter chips shown and removable
- [ ] "Clear all" resets all filters
- [ ] Kanban view shows four columns with cards
- [ ] List view shows sortable table
- [ ] View toggle persists to localStorage
- [ ] Empty state shown with no results
- [ ] Delete works with confirmation
- [ ] Load more pagination works
```

---

## PROMPT 6 — Analytics Dashboard with Tremor Charts

```
CONTEXT: [paste shared context block above]

TASK: Build the Analytics page with five Tremor charts and KPI cards, all connected to the live analytics API.

PAGE STRUCTURE:
- Header: "Analytics" + workspace name + date range tabs
- Row 1: Four KPI metric cards
- Row 2: Tracker (full width)
- Row 3: BarChart (left, 60%) + DonutChart (right, 40%)
- Row 4: AreaChart (full width)
- Row 5: BarList (full width)
- Row 6: AI weekly digest card

DATE RANGE TABS (shadcn Tabs):
- 7 days · 30 days · 90 days
- Changing tab re-fetches analytics with new ?range= param

FETCH LOGIC:
- GET /api/v1/analytics?range=7d&workspaceId=:id
- GET /api/v1/analytics/digest?workspaceId=:id
- Show Skeleton cards while loading (match card heights)

KPI CARDS (Tremor Metric or custom):
Four cards in a row:
1. Total tasks — value from stats.total, trend vs previous period
2. Completed — stats.completed, green if completion rate > 70%
3. Overdue — stats.overdue, amber if >0, red if >5
4. Completion rate — stats.completionRate + "%" with a colour indicator

DATA TRANSFORMATIONS (transform API response for each chart):
The API returns: { total, completed, overdue, completionRate, avgPriority, topCategories, digest, dailyStats }

CHART 1 — Tracker (Tremor):
- Shows daily task completion as a colour-coded calendar heatmap
- Map dailyStats array: { date, completed, total }
- Color: completionRate === 0 = gray, < 50% = amber, ≥ 50% = teal, 100% = green
- Tooltip: "3 of 5 tasks completed"
- Label: "Daily completion — last 30 days"

CHART 2 — BarChart (Tremor):
- X axis: week labels (Week 1, Week 2...)
- Y axis: number of tasks completed
- Group by "completed" (blue bar) and "created" (gray bar)
- Title: "Tasks this period"
- Use weeklyStats from API response

CHART 3 — DonutChart (Tremor):
- Slices: bug / feature / chore / research
- Values from stats.topCategories array
- Colours: bug=red, feature=blue, chore=amber, research=teal
- Show value labels on hover
- Title: "Tasks by category"

CHART 4 — AreaChart (Tremor):
- X axis: dates
- Y axis: cumulative tasks completed
- Single area in teal
- Title: "Cumulative completion trend"
- Use cumulativeStats from API response

CHART 5 — BarList (Tremor):
- List of team members with their task completion count
- Bar fills proportionally to highest count
- Show member name + count on right
- Title: "Top contributors"
- Use memberStats from API response

AI DIGEST CARD (bottom):
- Card with header "Weekly AI digest" + calendar badge (week number)
- Body: digest.content (AI-generated summary text)
- Footer: "Generated " + relative time (e.g. "3 days ago")
- If no digest yet: "Your first digest will be generated next Monday at 9am"

SKELETON LOADING:
- KPI cards: 4 gray rectangles (height 80px)
- Chart areas: gray rectangles matching each chart's expected height
- Skeleton uses shadcn/ui Skeleton component

COMPONENTS:
- Tremor: AreaChart, BarChart, DonutChart, BarList, Tracker, Metric (or custom KPI card)
- shadcn/ui: Tabs, TabsList, TabsTrigger, TabsContent, Card, Skeleton, Badge

API:
- GET /api/v1/analytics?range=7d&workspaceId=:id
  Response: {
    total, completed, overdue, completionRate, avgPriority,
    topCategories: [{ name, count }],
    weeklyStats: [{ week, completed, created }],
    dailyStats: [{ date, completed, total }],
    cumulativeStats: [{ date, cumulative }],
    memberStats: [{ name, count }]
  }
- GET /api/v1/analytics/digest?workspaceId=:id
  Response: { content, week, generatedAt }

ACCEPTANCE CRITERIA:
- [ ] All five Tremor charts render with real API data
- [ ] KPI cards show correct values with colour indicators
- [ ] Date range tabs re-fetch with correct ?range= param
- [ ] Skeleton shown on every chart while loading
- [ ] AI digest card shows content or "coming soon" state
- [ ] Charts are responsive (full width on mobile)
- [ ] Dark mode works on all Tremor charts
- [ ] Tooltip on hover for all charts
```

---

## PROMPT 7 — Workspace Member Invites via Email

```
CONTEXT: [paste shared context block above]

TASK: Build the full member invite flow — invite by email, receive the link, and join the workspace.

INVITE BUTTON:
- In the workspace header or settings sidebar: "Invite members" button (ti-user-plus icon)
- Clicking opens a shadcn Dialog

INVITE DIALOG:
Title: "Invite team members to [Workspace Name]"

BODY:
- Email input field with placeholder "colleague@company.com"
- Press Enter or click "Add" to convert email to a chip
- Multiple emails can be added (up to 10)
- Email chips: show email + × to remove
- Validate email format on add — show inline error for invalid emails
- A list of existing workspace members below (fetched from GET /workspaces/:id/members)
  Each member: avatar + name + role badge + "Remove" button (owner only)

FOOTER:
- "Cancel" (ghost) + "Send invites" (primary, disabled if no emails)
- Showing count: "Sending to 3 people"

SEND LOGIC:
- On "Send invites": call POST /api/v1/workspaces/:id/invites
  Body: { emails: ["a@b.com", "c@d.com"] }
- Backend sends an email to each with a unique link:
  https://taskpulse.app/invite/:token
- On success: show toast "Invites sent to 3 people", clear chip list, close dialog
- On error: show error toast, keep dialog open

ACCEPT INVITE PAGE (/invite/:token route):
- On load: call GET /api/v1/invites/:token to validate
  - If invalid/expired: show "This invite link has expired or is invalid" + "Go to homepage" button
  - If valid: show workspace name, inviter name, and "Join [Workspace Name]" button
- Clicking Join:
  - If not logged in: redirect to /login?redirect=/invite/:token (token preserved in URL)
  - If logged in: call POST /api/v1/invites/:token/claim
    - On success: redirect to /dashboard, set new workspace as active, show welcome toast
    - On error: show error message

POST-LOGIN FLOW:
- After login, check localStorage for pending invite token
- If found: auto-claim, clear from localStorage, redirect to dashboard

COMPONENTS:
- shadcn/ui: Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Button, Badge, Avatar, AvatarFallback, ScrollArea (for member list)

API:
- GET  /api/v1/workspaces/:id/members
- POST /api/v1/workspaces/:id/invites     Body: { emails: string[] }
- GET  /api/v1/invites/:token
- POST /api/v1/invites/:token/claim

ACCEPTANCE CRITERIA:
- [ ] Invite button opens dialog
- [ ] Multiple emails can be added as chips
- [ ] Invalid email format shows error
- [ ] Existing members shown in dialog
- [ ] POST /invites called with correct emails array
- [ ] Success toast shown, dialog closes
- [ ] /invite/:token page validates token
- [ ] Expired token shows error state
- [ ] Valid token shows Join button
- [ ] Claiming invite when not logged in preserves the token through login
- [ ] On claim success, workspace becomes active and user is on dashboard
```

---

## PROMPT 8 — Task Edit Drawer + Checkbox Check-off

```
CONTEXT: [paste shared context block above]

TASK: Build the task edit drawer (shadcn Sheet) and checkbox check-off on all task lists.

TASK EDIT DRAWER:
- Triggered by: clicking any task card, task row, or "Edit" action
- Opens as a right-side Sheet (40% width on desktop, full on mobile)
- Does NOT navigate away — stays on current page

DRAWER HEADER:
- Task title (editable Input, auto-saves on blur)
- Status badge (clickable, opens inline Select dropdown)
- Close button (×)

DRAWER BODY — six editable fields:

1. STATUS (Select)
   Options: Todo · In Progress · Review · Done
   On change: call PATCH /tasks/:id { status } immediately (no save button needed for status)
   Show toast on success

2. PRIORITY (showing AI score + user override)
   Display: "AI score: 7 · Urgency: High · Category: Bug"
   Allow user to override priority with a 1-10 Input
   AI reasoning shown in a muted italic text block

3. ASSIGNEE (Select)
   Populated from GET /workspaces/:id/members
   Shows member avatar + name in dropdown
   Unassigned option at top

4. DUE DATE (DatePicker with Calendar Popover)
   shadcn Popover wrapping a Calendar component
   Display format: "Jan 15, 2024" or "Overdue · Jan 10" in red
   Clear date option

5. DESCRIPTION (Textarea)
   Auto-resize textarea
   Placeholder: "Add a description..."
   Save on blur (PATCH /tasks/:id)

6. LABELS (multi-select chips)
   Click "+ Add label" to open a small dropdown with preset labels:
   bug · frontend · backend · design · urgent · blocked
   Selected labels shown as coloured chips

DRAWER FOOTER:
- "Delete task" (destructive, ghost red button, left side)
  - Confirm with a small inline popover: "Delete this task? This cannot be undone" + Confirm button
  - On confirm: DELETE /tasks/:id, close drawer, remove task from list, show toast
- "Save changes" (primary, right side)
  - Saves all pending changes that weren't auto-saved (description, labels)
  - PATCH /tasks/:id with full updated task

CHECKBOX CHECK-OFF (on all list views):
- shadcn Checkbox on left of every task row
- When checked:
  1. Optimistic update: title gets line-through, row opacity 50%
  2. Call PATCH /tasks/:id { status: "done" }
  3. On success: animate row out (fade + slide), show toast "Task completed"
  4. On error: revert checkbox, restore opacity, show error toast
- When unchecked (if task is done):
  1. Call PATCH /tasks/:id { status: "todo" }

WEBSOCKET:
- After any PATCH, emit (or let backend handle) a task:updated event to workspace room
- All other users connected to the workspace see the update in real time without refresh

COMPONENTS:
- shadcn/ui: Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, Select, SelectTrigger, SelectContent, SelectItem, Popover, PopoverTrigger, PopoverContent, Calendar, Input, Textarea, Checkbox, Badge, Button, Avatar

API:
- GET  /api/v1/workspaces/:id/members
- PATCH /api/v1/tasks/:id   Body: Partial<Task>
- DELETE /api/v1/tasks/:id

ACCEPTANCE CRITERIA:
- [ ] Clicking any task opens the right-side drawer
- [ ] All six fields are editable
- [ ] Status change auto-saves (no save button needed)
- [ ] Due date picker with Calendar works
- [ ] Assignee dropdown shows workspace members
- [ ] Description auto-saves on blur
- [ ] Labels are addable and removable as chips
- [ ] Delete requires confirmation
- [ ] Checkbox triggers optimistic update
- [ ] Successful check-off animates row out
- [ ] Error on PATCH reverts optimistic state
- [ ] Dark mode works throughout
```

---

## PROMPT 9 — Status Sync to Backend (Shared Pattern)

```
CONTEXT: [paste shared context block above]

TASK: Implement a consistent status-update pattern shared across all task status-change surfaces.

THE PROBLEM:
Currently, tasks have three places where status can change:
1. Checkbox in Inbox / task list (marks done)
2. Status dropdown in task edit drawer
3. Kanban board column drag (moves card between columns)

Each of these needs to call the same API and handle errors the same way.

SOLUTION — Create a shared useTaskStatus hook:

CREATE FILE: src/hooks/useTaskStatus.ts

```typescript
export function useTaskStatus() {
  const updateStatus = async (
    taskId: string,
    newStatus: Task["status"],
    onOptimisticUpdate: () => void,
    onRevert: () => void
  ) => {
    // 1. Apply optimistic update immediately
    onOptimisticUpdate()

    try {
      const res = await apiClient.patch(`/tasks/${taskId}`, { status: newStatus })
      if (!res.ok) throw new Error("Failed to update")

      toast.success(newStatus === "done" ? "Task completed!" : "Status updated")

      // Emit WebSocket event for real-time sync
      socket.emit("task:update", { taskId, status: newStatus })

    } catch (err) {
      // Revert the optimistic update
      onRevert()
      toast.error("Failed to update task status. Please try again.")
    }
  }

  return { updateStatus }
}
```

USAGE IN CHECKBOX:
```typescript
const { updateStatus } = useTaskStatus()
const [status, setStatus] = useState(task.status)

const handleCheck = (checked: boolean) => {
  const newStatus = checked ? "done" : "todo"
  const prevStatus = status
  updateStatus(
    task.id,
    newStatus,
    () => setStatus(newStatus),   // optimistic
    () => setStatus(prevStatus)   // revert
  )
}
```

USAGE IN STATUS DROPDOWN:
```typescript
const handleStatusChange = (newStatus: string) => {
  const prevStatus = task.status
  updateStatus(
    task.id,
    newStatus as Task["status"],
    () => setLocalStatus(newStatus),
    () => setLocalStatus(prevStatus)
  )
}
```

USAGE IN KANBAN DRAG:
```typescript
const handleDrop = (taskId: string, newStatus: string) => {
  const task = tasks.find(t => t.id === taskId)
  const prevStatus = task.status
  updateStatus(
    taskId,
    newStatus as Task["status"],
    () => moveTaskInState(taskId, newStatus),
    () => moveTaskInState(taskId, prevStatus)
  )
}
```

WEBSOCKET LISTENER:
In the WorkspaceProvider, listen for task:updated events from the server:
```typescript
useEffect(() => {
  socket.on("task:updated", ({ taskId, status }) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  })
  return () => socket.off("task:updated")
}, [])
```

TOAST MESSAGES:
- Status → done: "Task completed! ✓"
- Status → in-progress: "Task started"
- Status → review: "Task moved to review"
- Status → todo: "Task reopened"
- Error: "Could not update status. Reverting."

API:
- PATCH /api/v1/tasks/:id   Body: { status: "todo" | "in-progress" | "review" | "done" }

ACCEPTANCE CRITERIA:
- [ ] useTaskStatus hook created and exported
- [ ] Hook used in: Inbox checkbox, drawer status dropdown, Kanban drag
- [ ] Optimistic update applied before API call
- [ ] Revert fires on API error
- [ ] Correct toast message per status transition
- [ ] WebSocket emits task:update after successful PATCH
- [ ] WebSocket listener updates other users' task lists in real time
- [ ] No duplicate logic — all status updates go through the hook
```

---

## PROMPT 10 — Settings Page: Logout + Profile Edit

```
CONTEXT: [paste shared context block above]

TASK: Build the Settings page with logout, profile editing, and avatar upload.

PAGE LAYOUT:
- Settings sidebar with three sections: Profile · Workspace · Account
- Content area on the right

PROFILE SECTION:

AVATAR:
- Show current avatar (from user.avatar URL) using shadcn Avatar
- If no avatar: show initials circle (first letter of name, coloured by name hash)
- "Change photo" button below avatar
  - Opens hidden <input type="file" accept="image/*">
  - On file select:
    1. Show preview of selected image (URL.createObjectURL)
    2. Call GET /api/v1/attachments/presign?filename=:name&type=:mimeType
    3. Upload file directly to the returned presignedUrl using fetch() PUT
    4. Call PATCH /api/v1/users/me { avatar: s3FileUrl }
    5. Update user context with new avatar URL
    6. Show success toast "Profile photo updated"
  - Max file size: 5MB — show error if exceeded
  - Accepted formats: JPG, PNG, GIF, WebP

PROFILE FORM:
Fields (all in one form, submitted together):
1. Full name (Input, required)
2. Email (Input, disabled — not editable)
3. Role (Select)
   Options: Developer · Designer · Product Manager · Marketing · Other
4. Timezone (Select, searchable — all IANA timezones)
   Show current timezone pre-selected

SAVE BUTTON:
- "Save profile" button, disabled if no changes made
- On click: PATCH /api/v1/users/me { name, role, timezone }
- Show loading spinner on button while saving
- On success: toast "Profile updated" + update user context
- On error: toast "Failed to save profile"

WORKSPACE SECTION:
- Workspace name (Input, editable)
- Workspace timezone (Select)
- "Digest enabled" toggle (Switch) — enables/disables weekly AI digest
- Danger zone: "Delete workspace" (red button, opens confirmation Dialog)
  Confirm text: type workspace name to confirm
  On confirm: DELETE /api/v1/workspaces/:id → redirect to /dashboard

ACCOUNT SECTION:

LOGOUT BUTTON:
- Red/destructive outlined button: "Log out"
- On click:
  1. Call POST /api/v1/auth/logout (to revoke refresh token on server)
  2. Remove "accessToken" and "refreshToken" from localStorage
  3. Clear all React context state
  4. Redirect to / (landing page)
- No confirmation needed (logout is reversible)

DELETE ACCOUNT:
- "Delete my account" (small, muted red link)
- Opens Dialog: "This will permanently delete your account and all data. This cannot be undone."
- Requires typing "DELETE" to confirm
- On confirm: DELETE /api/v1/users/me → logout + redirect to /

COMPONENTS:
- shadcn/ui: Avatar, AvatarImage, AvatarFallback, Input, Select, Switch, Button, Dialog, DialogContent, DialogHeader, DialogFooter, Separator, Label, Skeleton

API:
- GET  /api/v1/users/me
- PATCH /api/v1/users/me       Body: { name?, role?, timezone?, avatar? }
- POST /api/v1/auth/logout
- GET  /api/v1/attachments/presign?filename=:name&type=:mimeType
- DELETE /api/v1/workspaces/:id
- DELETE /api/v1/users/me
- PATCH /api/v1/workspaces/:id   Body: { name?, timezone?, digestEnabled? }

ACCEPTANCE CRITERIA:
- [ ] Profile form shows current user data on load
- [ ] Avatar upload: file select → S3 presigned upload → PATCH user → preview updates
- [ ] File size validation (reject > 5MB)
- [ ] Form save button disabled until changes made
- [ ] PATCH /users/me called on save with changed fields only
- [ ] Logout: POST /auth/logout + clear tokens + redirect to /
- [ ] Workspace settings form saves correctly
- [ ] Digest switch toggles and saves
- [ ] Delete workspace requires name confirmation
- [ ] Delete account requires "DELETE" text confirmation
- [ ] All loading states shown
- [ ] Works in dark mode
```

---

## PROMPT 11 — Dark / Light Theme Toggle

```
CONTEXT: [paste shared context block above]

TASK: Implement a dark/light theme toggle in Settings that persists across sessions.

STRATEGY:
- Tailwind CSS dark mode via class strategy: add/remove "dark" class on <html>
- Preference stored in localStorage key "theme" with values "dark" | "light" | "system"
- System preference detected via window.matchMedia("(prefers-color-scheme: dark)")

INITIAL THEME SCRIPT (must run before React renders):
Add this inline script as the FIRST child of <head> in index.html to prevent flash of wrong theme:

<script>
  (function() {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored === "dark" || (!stored && prefersDark) || (stored === "system" && prefersDark)
    if (isDark) document.documentElement.classList.add("dark")
  })()
</script>

THEME CONTEXT (src/contexts/ThemeContext.tsx):
- Create useTheme hook returning: { theme, setTheme, isDark }
- theme: "light" | "dark" | "system"
- setTheme: saves to localStorage + updates html class
- isDark: computed from theme + system preference
- Listen for system preference changes (matchMedia listener)

SETTINGS UI:
In the Settings page Appearance section:
- Section title: "Appearance"
- Three options shown as radio cards:
  - Light (ti-sun icon) — white card
  - Dark (ti-moon icon) — dark card
  - System (ti-device-desktop icon) — shows current: "Following system (currently Dark)"
- Active option has a coloured border

ALSO add a compact toggle to the top navbar:
- A single icon button cycling Light → Dark → System on each click
- ti-sun for light, ti-moon for dark, ti-device-desktop for system
- Tooltip shows current mode

TAILWIND CONFIG:
Ensure tailwind.config.js has:
  darkMode: "class"

All components must use:
- bg-white dark:bg-gray-900
- text-gray-900 dark:text-gray-100
- border-gray-200 dark:border-gray-800
shadcn/ui components already handle dark mode via CSS variables — no extra Tailwind classes needed for shadcn components.

COMPONENTS:
- shadcn/ui: Switch, Label, Button (icon variant), Tooltip, TooltipContent, TooltipTrigger

ACCEPTANCE CRITERIA:
- [ ] Inline script in <head> prevents flash of wrong theme on load
- [ ] Theme persists across page refresh and new tabs
- [ ] Settings page shows three-option appearance selector
- [ ] Active option has visual indicator
- [ ] Navbar icon cycles through three modes
- [ ] System mode auto-updates when OS theme changes
- [ ] All existing pages look correct in dark mode
- [ ] localStorage key "theme" stores the preference
```

---

## PROMPT 12 — Shared Component Library Setup + Usage Patterns

```
CONTEXT: [paste shared context block above]

TASK: Install, configure, and document all shadcn/ui components needed across the app. Create a shared component reference file.

INSTALL COMMANDS (run these first):

npx shadcn-ui@latest init
# Answer: TypeScript: Yes, Tailwind: Yes, Style: Default, Base colour: Neutral, CSS variables: Yes

npx shadcn-ui@latest add button input label select textarea checkbox badge avatar tabs
npx shadcn-ui@latest add dialog sheet command popover calendar
npx shadcn-ui@latest add accordion switch separator skeleton toast
npx shadcn-ui@latest add dropdown-menu navigation-menu
npx shadcn-ui@latest add sonner

npm install @tremor/react
npm install date-fns
npm install socket.io-client

TAILWIND CONFIG (tailwind.config.js):
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
}

CREATE FILE: src/components/ui/DatePicker.tsx
(shadcn does not ship DatePicker — build it from Calendar + Popover + Button):

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

CREATE FILE: src/components/ui/DateRangePicker.tsx
(same pattern but Calendar mode="range", value is { from: Date, to: Date }):
- Show "Jan 10 – Jan 17" when both dates selected
- Show "Jan 10 – ?" when only from is selected
- Single Calendar component with mode="range"

CREATE FILE: src/lib/apiClient.ts
(shared fetch wrapper with auth header injection):

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken")
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    // Try refresh token
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login"
      throw new Error("Session expired")
    }
    return request(path, options) // Retry with new token
  }
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = localStorage.getItem("refreshToken")
  if (!refresh) return false
  try {
    const data = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }).then(r => r.json())
    localStorage.setItem("accessToken", data.accessToken)
    return true
  } catch { return false }
}

export const apiClient = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
}

COMPONENT USAGE REFERENCE:

// Calendar (date display — use inside DatePicker, not standalone)
<Calendar mode="single" selected={date} onSelect={setDate} />

// Checkbox
<Checkbox checked={isChecked} onCheckedChange={(v) => setChecked(Boolean(v))} />

// Switch (toggle)
<Switch checked={enabled} onCheckedChange={setEnabled} />
<Label htmlFor="digest">Enable weekly digest</Label>

// Input
<Input type="text" placeholder="Task title" value={val} onChange={e => setVal(e.target.value)} />

// Accordion (for FAQ)
<Accordion type="single" collapsible>
  <AccordionItem value="q1">
    <AccordionTrigger>How does AI scoring work?</AccordionTrigger>
    <AccordionContent>When you create a task...</AccordionContent>
  </AccordionItem>
</Accordion>

// Toast (via Sonner)
import { toast } from "sonner"
toast.success("Task saved!")
toast.error("Something went wrong")

// Add <Toaster /> to App.tsx root

ACCEPTANCE CRITERIA:
- [ ] npx shadcn-ui@latest add commands install all components without errors
- [ ] tailwind.config.js has darkMode: "class"
- [ ] DatePicker component built from Calendar + Popover + Button
- [ ] DateRangePicker component built similarly
- [ ] apiClient.ts handles auth header injection
- [ ] apiClient.ts handles 401 → token refresh → retry
- [ ] apiClient.ts handles failed refresh → logout + redirect
- [ ] <Toaster /> added to App.tsx
- [ ] socket.io-client installed and socket instance exported from src/lib/socket.ts
- [ ] All imports use @/components/ui/... alias
```

---

## HOW TO USE THESE PROMPTS IN ANTIGRAVITY

1. Open a new Claude-opus agent session in Antigravity
2. Start every session by pasting the SHARED CONTEXT BLOCK first
3. Then paste ONE prompt (e.g. Prompt 2) for that session
4. Let the agent implement, then review + test
5. If the agent produces partial output, paste the remaining ACCEPTANCE CRITERIA as a follow-up to check gaps
6. Start a NEW session for each prompt (do not chain all 12 in one session — context window will be too full)

## RECOMMENDED ORDER

Do Prompt 12 first (component setup) — all other prompts depend on the shared components being installed.
Then follow this order: 12 → 11 → 2 → 3 → 9 → 8 → 4 → 5 → 6 → 7 → 10 → 1

This order installs infrastructure first, then core data features, then UI polish, then the landing page last.
