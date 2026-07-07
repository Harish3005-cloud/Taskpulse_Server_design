# Goal: Implement Project Invitation & Collaboration System

We will implement a project-level collaboration model for TaskPulse, where users can invite others specifically to a Project, rather than a Workspace. The existing architecture (one workspace per user) will be strictly maintained.

## Proposed Changes

### Database & Models

#### [NEW] `src/modules/invites/invites.model.js`
Create a new Mongoose schema for `Invitation`:
- `email`: String (required)
- `projectId`: ObjectId (ref: 'Project', required)
- `invitedBy`: ObjectId (ref: 'User', required)
- `role`: String (default: 'member')
- `token`: String (unique, required)
- `status`: String (enum: ['pending', 'accepted', 'expired'], default: 'pending')
- `expiresAt`: Date
- `acceptedAt`: Date

#### [MODIFY] `src/modules/projects/projects.model.js`
Update the `members` array to track roles and join dates:
```javascript
  members: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
```

---

### Backend Logic

#### [MODIFY] `src/modules/projects/projects.routes.js`
Add endpoints:
- `POST /api/v1/projects/:id/invite` - Only project owner/lead can invite.
- `GET /api/v1/projects/shared` - List all projects where user is a member but NOT the owner (to populate the sidebar).
- `DELETE /api/v1/projects/:id/members/:userId` - Remove a member.

#### [MODIFY] `src/modules/projects/projects.controller.js` & `projects.service.js`
- Implement `inviteMember` to generate token (valid for 7 days), save to `Invitation` model, and send email.
- Update `verifyWorkspaceMembership` logic to also allow access if the user is a `member` of the specific project, enabling cross-workspace project access.
- Implement `listSharedProjects` to find projects where `members.user` matches the logged-in user, but `workspaceId` does NOT match the user's workspace.

#### [MODIFY] `src/modules/invites/invites.routes.js`
Add endpoints:
- `GET /api/v1/invites/:token` - Validate and fetch project info.
- `POST /api/v1/invites/:token/accept` - Claim an invite (must be logged in), updates project `members`, sets invite to `accepted`.

#### [MODIFY] `src/modules/invites/invites.controller.js`
Rewrite completely to support project invites (validating token against new Invite schema).

#### [MODIFY] `src/shared/services/email.service.js`
Update `sendWorkspaceInviteEmail` to `sendProjectInviteEmail` incorporating the new template.

---

### Frontend Logic

#### [MODIFY] `sample-design/src/App.jsx`
- Add a new route `Route path="/invite/:token" element={<InvitePage />}`.

#### [NEW] `sample-design/src/pages/InvitePage.jsx`
- Fetch invite details.
- If user logged in: show Accept button.
- If not logged in: save token to sessionStorage, redirect to `/signup?invite=true`.

#### [MODIFY] `sample-design/src/components/AuthPage.jsx`
- If completing registration with a stored invite token, automatically call the accept invite endpoint in the background before redirecting to the dashboard.

#### [MODIFY] `sample-design/src/components/sidebar/Sidebar.jsx`
- Add a new section `Shared Projects` beneath the current workspace navigation.
- Call `/api/v1/projects/shared` on load to fetch and render these shared projects.

#### [MODIFY] `sample-design/src/components/projects/ProjectDetails.jsx`
- Render the `members` list with roles and join dates.
- Add an "Invite Member" button (only visible to owner/lead).
- Add "Remove" functionality.

#### [NEW] `sample-design/src/components/projects/InviteMemberModal.jsx`
- A modal to collect email and role, posting to `/api/v1/projects/:id/invite`.

## Verification Plan

### Automated/Manual Verification
- Generate an invite link.
- Open link in Incognito. Sign up, verify automatic acceptance into the Project and it appears under "Shared Projects".
- Verify project permissions (members can view tasks, but not invite others unless allowed).
- Verify the main workspace isolation remains intact.
