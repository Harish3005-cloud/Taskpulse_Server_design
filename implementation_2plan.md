# Implementation Plan: Linear Feature Parity + Auth Redirect

This plan addresses all 6 critical UI gaps identified in the [Linear vs TaskPulse gap analysis](file:///C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_vs_taskpulse_gaps.md) plus the auth redirect feature.

---

## Feature 0: Auth Redirect for Logged-In Users

When a user who is already authenticated visits `/` (the landing page), redirect them to `/dashboard`.

#### [MODIFY] [App.jsx](file:///d:/SaaS/sample/sample-design/src/App.jsx)
- Import `useAuth` from AuthContext.
- Create a `<ProtectedRoute>` wrapper that checks `isAuthenticated`.
- Change the `/` route: if `isAuthenticated`, render `<Navigate to="/dashboard" />`, else render `<LandingPage />`.
- Similarly gate `/login` and `/signup` — redirect to dashboard if already logged in.

---

## Feature 1: Team Overview Page

When clicking a team name in the sidebar, show an Overview page with tabs (Overview / Documents / Members) instead of jumping straight to Issues. This matches Linear's team hub.

#### [NEW] `src/components/team/TeamOverview.jsx`
- Tabs: **Overview** | **Documents** | **Members**
- Overview tab: Team icon + name, editable description placeholder, "Pinned resources" section
- Right sidebar: Members list (avatars), "Go to" shortcuts (Team settings, Issues, Projects, Views)
- Documents tab: Empty state with "Add documents and links"
- Members tab: Table showing member name, email, role, joined date

#### [MODIFY] [App.jsx](file:///d:/SaaS/sample/sample-design/src/App.jsx)
- Add route: `<Route path=":teamSlug" element={<TeamOverview />} />`
- This makes `/dashboard/hari-team` show the overview, while `/dashboard/hari-team/tasks` shows issues

#### [MODIFY] [Sidebar.jsx](file:///d:/SaaS/sample/sample-design/src/components/sidebar/Sidebar.jsx)
- When clicking a team name, navigate to `/dashboard/:teamSlug` (overview) instead of toggling the expand

---

## Feature 2: Projects Table

Replace the empty-state stub with a proper data table matching Linear's project list columns.

#### [MODIFY] [ProjectList.jsx](file:///d:/SaaS/sample/sample-design/src/components/projects/ProjectList.jsx)
- Full rewrite. Build a sortable table with columns: **Name**, **Health**, **Priority**, **Lead**, **Target date**, **Issues**, **Status** (% complete)
- "All projects" filter tab + settings icon
- "+" button to create a new project
- Column headers are clickable for sorting
- Each row shows project icon, name, health indicator (colored dot), priority badge, lead avatar, target date, issue count, and progress percentage
- Empty state shown only if no projects exist

> [!NOTE]
> This is frontend-only for now — we don't have a Project model in the backend yet. The component will use local state / mock data so the UI is ready for when the backend is built.

---

## Feature 3: Issue Multi-Select + Bulk Actions

Add checkboxes to task rows for multi-selection and a floating bulk-action bar.

#### [MODIFY] [TaskRow.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskRow.jsx)
- Add a checkbox before the priority dots (visible on hover, always visible when any item is selected)
- Accept `isSelected` and `onToggleSelect` props
- Checkbox click should stop propagation (don't navigate to detail)

#### [MODIFY] [TaskList.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskList.jsx)
- Manage `selectedTaskIds` state (Set)
- Pass selection props down to each `<TaskRow />`
- Add "Select all in group" checkbox on the status group header

#### [NEW] `src/components/tasks/BulkActionBar.jsx`
- Floating bar that appears at the bottom when ≥1 task is selected
- Shows: "{n} selected" count, and action buttons: **Set status**, **Set priority**, **Assign**, **Delete**
- Each action opens a small dropdown/popover for the value to apply
- On action confirm, calls the appropriate API (`PATCH /tasks/:id`) for each selected task

---

## Feature 4: Detail Panel Toggle (Split-Pane)

Allow previewing a task's details in a right-side panel without navigating away from the list — like Linear's side-peek.

#### [NEW] `src/components/tasks/TaskDetailPanel.jsx`
- A slide-in panel (right side, ~400px wide) that shows task detail content
- Shows: title, description, status, priority, assignee, due date, AI score card
- Has a close button (×) and an "Open full page" button to navigate to `/dashboard/task/:id`
- Animated slide-in from the right

#### [MODIFY] [TaskList.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskList.jsx)
- Add a "detail panel toggle" icon button in the filter bar (matching Linear's `□` icon at top-right)
- Track `detailPanelEnabled` state
- When enabled and a task row is clicked, open `<TaskDetailPanel>` instead of navigating

#### [MODIFY] [TaskRow.jsx](file:///d:/SaaS/sample/sample-design/src/components/tasks/TaskRow.jsx)
- Accept an `onPreview` prop. When detail panel mode is on, clicking calls `onPreview(task)` instead of `navigate()`

---

## Feature 5: Saved Custom Views

Let users save filtered/sorted issue lists as named views.

#### [NEW] `src/components/views/ViewsPage.jsx` (full rewrite of existing stub)
- Sub-tabs: **Issues** | **Projects** (matching Linear)
- List of saved views with name, filter description, creator
- "Create new view" button opens a modal
- Each saved view is clickable — navigates to the issues list with that filter applied
- Empty state matching Linear's design (icon, description, "Create new view" + "Documentation" buttons)

#### [NEW] `src/components/views/CreateViewModal.jsx`
- Modal with: View name input, filter selectors (status, priority, assignee), sort selector
- "Save view" button stores to local state (no backend endpoint yet)

#### [MODIFY] [WorkspaceContext.jsx](file:///d:/SaaS/sample/sample-design/src/context/WorkspaceContext.jsx)
- Add `savedViews` state (array of view objects, persisted to localStorage)
- Add `addView`, `deleteView` functions

---

## Feature 6: Settings Page with Sidebar + Profile

Enhance the existing SettingsPage to have a proper sidebar with navigation and add a Profile sub-page.

#### [MODIFY] [SettingsPage.jsx](file:///d:/SaaS/sample/sample-design/src/components/settings/SettingsPage.jsx)
- Already has sidebar structure! Just need to make sidebar items clickable to switch between sub-pages
- Convert to use local `activeSection` state to switch rendered content

#### [NEW] `src/components/settings/ProfileSection.jsx`
- Shows: Avatar (large), Name, Email, Account creation date
- "Edit profile" form: Name input, Display name, Timezone selector
- "Change avatar" placeholder
- "Delete account" danger zone at the bottom

#### [NEW] `src/components/settings/NotificationsSection.jsx`
- Toggle switches for: Email notifications, In-app notifications, AI digest emails, Task assignment alerts, Mention alerts
- All toggles use the existing `tp-toggle` component

#### [NEW] `src/components/settings/WorkspaceSection.jsx`
- Shows current workspace name (editable), timezone, plan tier
- Members list with role management (read-only for now)
- "Invite members" button (uses existing invite API)
- Danger zone: "Archive workspace"

---

## Routing Changes Summary

```diff
 // App.jsx routes
 <Route path="/" element={<LandingPage />} />
+    → Wrap with auth check: if authenticated, <Navigate to="/dashboard" />

 <Route path="/dashboard" element={...}>
   <Route index element={<Navigate to="inbox" replace />} />
   <Route path="inbox" element={<Inbox />} />
   <Route path="my-tasks" element={<MyTasks />} />
   <Route path="projects" element={<ProjectList />} />
   <Route path="views" element={<ViewsPage />} />
   <Route path="analytics" element={<AnalyticsDashboard />} />
-  <Route path="settings" element={<SettingsPage />} />
+  <Route path="settings/*" element={<SettingsPage />} />

+  <Route path=":teamSlug" element={<TeamOverview />} />
   <Route path=":teamSlug/tasks" element={<TeamTasksView />} />
   <Route path=":teamSlug/projects" element={<ProjectList />} />
   <Route path=":teamSlug/views" element={<ViewsPage />} />

   <Route path="task/:taskId" element={<TaskDetail />} />
 </Route>
```

---

## New Files Summary

| File | Feature |
|------|---------|
| `src/components/team/TeamOverview.jsx` | Team overview page |
| `src/components/tasks/BulkActionBar.jsx` | Bulk actions floating bar |
| `src/components/tasks/TaskDetailPanel.jsx` | Side-peek detail panel |
| `src/components/views/CreateViewModal.jsx` | Create custom view modal |
| `src/components/settings/ProfileSection.jsx` | Profile settings sub-page |
| `src/components/settings/NotificationsSection.jsx` | Notification preferences |
| `src/components/settings/WorkspaceSection.jsx` | Workspace admin settings |

## Modified Files Summary

| File | Changes |
|------|---------|
| `App.jsx` | Auth redirect, TeamOverview route, settings wildcard route |
| `Sidebar.jsx` | Team name click → overview page |
| `TaskRow.jsx` | Checkbox + onPreview prop |
| `TaskList.jsx` | Multi-select state, detail panel toggle |
| `ProjectList.jsx` | Full rewrite → data table |
| `ViewsPage.jsx` | Full rewrite → saved views list |
| `SettingsPage.jsx` | Active section switching |
| `WorkspaceContext.jsx` | savedViews state + localStorage |

---

## Verification Plan

### Manual Verification
1. Visit `/` while logged in → should redirect to `/dashboard`
2. Visit `/login` while logged in → should redirect to `/dashboard`
3. Click a team name in sidebar → should show Team Overview page with tabs
4. Click "Issues" under team → should show issues list with checkboxes on hover
5. Select multiple tasks → floating bulk action bar should appear
6. Click the detail panel toggle icon → clicking a task should open side panel instead of navigating
7. Go to Projects → should see sortable data table (or empty state with create button)
8. Go to Views → should see saved views list with "Create new view" button
9. Go to Settings → sidebar items should be clickable, Profile section should show user info
