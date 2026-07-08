# Stale Project Progress Fix Plan

## Problem Analysis
During the E2E integration test, two issues caused the project progress to remain stale or at 0%:
1. **Backend Aggregation Type Mismatch:** In `projects.service.js`, the `$match` stage of `Task.aggregate` used the `workspaceId` string directly. However, Mongoose aggregate pipelines do not automatically cast strings to `ObjectId`. Thus, the stats query returned `[]` and progress became `0%`. *(Note: I have already fixed and deployed this backend fix to `main` prior to this plan).*
2. **Frontend Cache Invalidation:** The frontend lacks a unified caching library (like React Query). Tasks created globally via the `+ New Task` button or mutated inside `TaskBoard` don't trigger refetches in other components like `ProjectDetails` or `ProjectDashboard`.

## Proposed Solution

To make the progress **fully dynamic** across the entire UI (Project Cards, Project Details, Dashboard, Analytics) without manual refreshes, I will implement a global `refreshTrigger`.

### 1. WorkspaceContext
- Add a global `refreshTrigger` (a simple integer state) and a `triggerRefresh` function.
- Expose these to all components.

### 2. Mutation Sites (Triggering Refetches)
I will inject `triggerRefresh()` into the following mutation actions:
- `DashboardLayout.jsx` (Global task/project creation).
- `ProjectDetails.jsx` (Status change, updates, deletions).
- `TaskBoard.jsx` (Status change, updates, deletions).

### 3. Observer Sites (Listening for Refetches)
I will add `refreshTrigger` to the `useEffect` dependency arrays of the following data-fetching components so they instantly pull fresh data:
- `ProjectDetails.jsx` (Fetches `getProject` details and stats).
- `useProjectFilters.js` (Fetches task lists inside projects/boards).
- `ProjectDashboard.jsx` (Fetches the Project Cards list).
- `AnalyticsDashboard.jsx` (Fetches summary, trends, health).

## Verification
With this architecture, whenever a task goes from `Todo` to `Done`, `triggerRefresh()` fires, and `ProjectDetails`, `ProjectDashboard`, and `AnalyticsDashboard` will simultaneously fetch and display `100%`.

## User Review Required
> [!NOTE]
> Please approve this plan so I can quickly propagate the `refreshTrigger` across the frontend architecture.
