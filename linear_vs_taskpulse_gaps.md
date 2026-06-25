# Linear.app vs TaskPulse — UI Gap Analysis

> Based on a live audit of your Linear workspace (`hari`) on 2026-06-19.

---

## 1. Sidebar

````carousel
![Linear Sidebar](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_sidebar_1781810279579.png)
<!-- slide -->
### Linear Sidebar Structure
```
[HA] hari ▾          🔍  ✏️
─────────────────────────
Inbox
Reviews
My issues
─────────────────────────
Workspace ▾
  Projects
  Views
  ··· More
─────────────────────────
Your teams ▾
  🔴 Hari ▾
    ◎ Issues
    ⊕ Projects
    ◎ Views
─────────────────────────
Try ▾
  Import issues
  + Invite people
  Connect Cursor
  Connect Codex
─────────────────────────
What's new | Help
```
````

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| Workspace selector (initials + name + dropdown) | ✅ | ✅ | — |
| Search shortcut (Ctrl+K) | ✅ | ✅ Command Palette | — |
| Create issue shortcut | ✅ | ✅ | — |
| Inbox (notifications) | ✅ | ✅ | — |
| **Reviews** | ✅ | ❌ | 🔴 Not in TaskPulse |
| My Issues / My Tasks | ✅ | ✅ | — |
| Workspace-level Projects | ✅ | ✅ | — |
| Workspace-level Views | ✅ | ✅ | — |
| **"More" section** (Cycles, Modules) | ✅ | ❌ | 🟡 Nice to have |
| Teams → Issues/Projects/Views | ✅ | ✅ | — |
| **"Try" section** (Import, Invite, Connect) | ✅ | 🟡 Partial | Only has "New workspace" and "Create task". Missing Import/Invite/Connect |
| **Changelog ("What's new")** | ✅ | ❌ | 🟡 Nice to have |
| Settings / Help in footer | ✅ | ✅ | — |

---

## 2. Team/Workspace Overview

![Linear Team Overview](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_team_overview_1781810289409.png)

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| Tabs: Overview / Documents / Members | ✅ | ❌ No team overview page | 🔴 **Missing entire page** |
| Editable team icon | ✅ | ❌ | 🟡 |
| Editable team name (inline) | ✅ | ❌ | 🟡 |
| Editable description | ✅ | ❌ | 🟡 |
| Pinned resources section | ✅ | ❌ | 🟡 |
| Right sidebar: Members list | ✅ | ❌ | 🔴 |
| Right sidebar: "Go to" shortcuts | ✅ | ❌ | 🟡 |

> [!IMPORTANT]
> **The Team Overview page doesn't exist in TaskPulse at all.** When you click a team name in Linear, you land on this overview page with tabs for Overview/Documents/Members. In TaskPulse, clicking a team goes straight to the Issues view. This is a significant UI gap — it's the central hub for workspace info.

---

## 3. Issues View

![Linear Issues View](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_issues_view_1781810305590.png)

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| Sub-tabs: All Issues / Active / Backlog | ✅ | ✅ (All tasks / Active / Backlog) | — |
| **"+" button to save custom view** | ✅ | ❌ | 🔴 Missing |
| Filter button | ✅ | ✅ (icon only, not functional) | 🟡 Not wired |
| Display/Grouping options | ✅ | ✅ (icon only) | 🟡 Not wired |
| **Detail panel toggle** | ✅ | ❌ | 🔴 Missing |
| Status group headers (collapse + count + add) | ✅ | ✅ | — |
| Issue row: Priority icon | ✅ (···) | ✅ | — |
| Issue row: Issue key (HAR-2) | ✅ | ✅ (identifier) | — |
| Issue row: Status circle | ✅ | ✅ | — |
| Issue row: Title | ✅ | ✅ | — |
| Issue row: Assignee avatar | ✅ | ✅ | — |
| Issue row: Date | ✅ | ✅ | — |
| **Issue row: Checkbox (multi-select)** | ✅ | ❌ | 🔴 Missing |
| **Breadcrumb navigation** (Hari > Issues) | ✅ | ✅ | — |

---

## 4. Projects View

![Linear Projects View](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_projects_view_1781810327629.png)

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| "New project" button | ✅ | ❌ | 🔴 |
| Table columns: Name, Health, Priority, Lead, Target date, Issues, Status | ✅ | ❌ | 🔴 **Entire table missing** |
| Sortable column headers | ✅ | ❌ | 🔴 |
| Project icon picker | ✅ | ❌ | 🟡 |
| Progress percentage | ✅ | ❌ | 🔴 |
| Filter / Display options | ✅ | ❌ | 🟡 |

> [!WARNING]
> **The Projects page in TaskPulse is a placeholder.** [ProjectList.jsx](file:///d:/SaaS/sample/sample-design/src/components/projects/ProjectList.jsx) is only 1.5KB — it's a stub. Linear's Projects view is a full data table with sortable columns (Name, Health, Priority, Lead, Target date, Issues, Status %). This is a major feature gap.

---

## 5. Views Page

![Linear Views Page](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_views_view_1781810347795.png)

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| Sub-tabs: Issues / Projects | ✅ | ❌ | 🟡 |
| "Create new view" button | ✅ | ❌ | 🔴 |
| Empty state with explanation + action | ✅ | 🟡 | TaskPulse has a basic empty state |
| Display options control | ✅ | ❌ | 🟡 |
| Saved/Custom views list | ✅ | ❌ | 🔴 No backend for saved views |

---

## 6. Settings / Preferences

![Linear Settings Page](C:/Users/Harish/.gemini/antigravity-ide/brain/4d95f23d-1423-4b32-b007-dcf9078fe477/linear_settings_1781810387746.png)

| Feature | Linear | TaskPulse | Gap? |
|---------|--------|-----------|------|
| Dedicated settings layout (sidebar + content) | ✅ | 🟡 | TaskPulse has basic SettingsPage shell |
| **Settings sidebar categories** | ✅ | ❌ | 🔴 |
| Personal → Preferences | ✅ | ❌ | 🔴 |
| Personal → Profile | ✅ | ❌ | 🔴 |
| Personal → Notifications | ✅ | ❌ | 🔴 |
| Interface theme selector | ✅ | ❌ | 🟡 |
| Font size control | ✅ | ❌ | 🟡 |
| Issue labels / templates | ✅ | ❌ | 🟡 Future |
| Features (AI, Integrations, etc.) | ✅ | ❌ | 🟡 Future |
| Administration / Workspace settings | ✅ | ❌ | 🟡 Future |

---

## Summary: Key Gaps to Address

### 🔴 Critical (Missing entire features)

| # | Feature | Impact |
|---|---------|--------|
| 1 | **Team Overview page** (Overview/Documents/Members tabs) | No central hub for workspace info |
| 2 | **Projects table** with sortable columns (Health, Priority, Lead, Target date, Status %) | Projects page is a stub |
| 3 | **Issue multi-select** (checkboxes for bulk actions) | Can't bulk-update tasks |
| 4 | **Detail panel toggle** (split-pane view for issues) | Can't preview issues without navigating away |
| 5 | **Save custom view** ("+" button on issue lists) | No ability to save filtered views |
| 6 | **Settings sidebar** with categories (Personal, Issues, Projects, Features, Admin) | Settings is a flat shell |

### 🟡 Nice-to-have (Polish & completeness)

| # | Feature |
|---|---------|
| 7 | Filter/Display options buttons (exist in UI but aren't functional) |
| 8 | "Try" section: Import issues, Invite people (invite modal exists but isn't in sidebar "Try") |
| 9 | Editable team name/description/icon on overview page |
| 10 | Reviews section in sidebar |
| 11 | Changelog / "What's new" in footer |
| 12 | Interface theme selector in settings |
