# Walkthrough: Project Invitation & Collaboration System

I have successfully implemented the Project Invitation & Collaboration system. The architecture preserves the simplified model where each user has exactly ONE workspace, but users can invite others to specific projects.

## Changes Made

### Backend
1. **`Invitation` Model:** Created a new Mongoose schema in `src/modules/invites/invites.model.js` tailored for project-level invitations (includes `email`, `projectId`, `invitedBy`, `role`, `token`, `status`, `expiresAt`, `acceptedAt`).
2. **`Project` Model:** Modified the `members` array to track `user`, `role`, and `joinedAt`.
3. **`projects.service.js` & Controllers:**
   - Implemented `verifyProjectAccess` to allow cross-workspace access if a user is explicitly invited to a project.
   - Added `inviteMember` to generate a 7-day secure token, save it to the DB, and send a professional invite email via Resend.
   - Added `listSharedProjects` to fetch projects the user is a member of but doesn't own (outside their workspace).
   - Added `removeMember` for project owners.
4. **`invites.controller.js`:** Rewrote the entire module to validate the new project invite tokens and handle the acceptance logic (`claimInvite`).
5. **Email Service:** Updated `email.service.js` with a new `sendProjectInviteEmail` template.

### Frontend
1. **Invite Flow & `InvitePage.jsx`:** Created a new `/invite/:token` route that fetches invite details. If the user is logged in, they can immediately accept. If not, it saves the token to `sessionStorage` and directs them to signup.
2. **Auth Integration (`AuthPage.jsx`):** If a user registers or logs in with an active invite token in their session, the application automatically triggers the invite acceptance in the background and redirects them directly to the project page upon successful registration!
3. **Sidebar Navigation:** Added a new **Shared Projects** section in `Sidebar.jsx`. This queries `GET /api/v1/projects/shared` and dynamically populates projects the user is collaborating on.
4. **Project Members UI:** Updated `ProjectDetails.jsx` to render member avatars with their roles on hover. Only workspace owners see the "Invite Members" button.
5. **`InviteMemberModal.jsx`:** Created a dedicated UI for project owners to send email invitations with specified roles.

## What to Test
- **Send an Invite:** Navigate to a project you own, click the `+` button in the Team area, and send an invite to a secondary email address.
- **Acceptance Flow:** Open the invite link in an Incognito window. Proceed through registration, and verify you are automatically dropped into the shared project upon completion.
- **Sidebar Integration:** Verify the shared project appears in the left Sidebar under "Shared Projects".
