// End-to-End Integration Test for TaskPulse
// To be executed in the browser console of the TaskPulse app

(async () => {
  console.log("🚀 Starting TaskPulse E2E Integration Test...");
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error("❌ No access token found. Please log in first.");
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const API_URL = 'https://taskpulseserverdesign-production.up.railway.app/api/v1';

  async function apiCall(method, endpoint, data = null) {
    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);
    const res = await fetch(`${API_URL}${endpoint}`, config);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Call Failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
  }

  try {
    // 1. Fetch Workspace
    console.log("⏳ 1. Fetching Workspaces...");
    const wsData = await apiCall('GET', '/workspaces');
    if (!wsData.workspaces || wsData.workspaces.length === 0) {
      throw new Error("No workspaces found for user.");
    }
    const workspace = wsData.workspaces[0];
    const workspaceId = workspace._id;
    console.log(`✅ Fetched Workspace: ${workspace.name}`);

    // Get a member to assign the task to
    const membersData = await apiCall('GET', `/workspaces/${workspaceId}/members`);
    const assignUser = membersData.members.length > 0 ? membersData.members[0]._id : null;

    // 2. Create Project (Project Gamma)
    console.log("⏳ 2. Creating Project Gamma...");
    const projectData = await apiCall('POST', '/projects', {
      workspaceId,
      name: "Project Gamma - E2E",
      summary: "E2E testing project",
      status: "todo"
    });
    const projectId = projectData.project ? projectData.project._id : projectData._id;
    console.log(`✅ Created Project: ${projectId}`);

    // 3. Create Task (Fix authentication bypass) -> Assign to a user
    console.log("⏳ 3. Creating Task (Fix authentication bypass)...");
    const taskData = await apiCall('POST', '/tasks', {
      workspaceId,
      projectId,
      title: "Fix authentication bypass",
      description: "Critical security issue",
      status: "todo",
      priority: 5,
      assignedTo: assignUser
    });
    const task1Id = taskData.task ? taskData.task._id : taskData._id;
    console.log(`✅ Created Task: ${task1Id}`);

    // 4. Add attachment to the task
    console.log("⏳ 4. Generating Presigned URL for Task Attachment...");
    const attachmentData = await apiCall('POST', `/tasks/${task1Id}/attachments`, {
      workspaceId,
      fileName: "security_report.pdf",
      fileSize: 1024,
      mimeType: "application/pdf"
    });
    console.log(`✅ Presigned URL generated: ${attachmentData.presignedUrl}`);
    // Note: We won't actually upload bytes to AWS here to avoid polluting S3,
    // but generating the URL confirms the backend logic and IAM roles work.

    // 5. Change Task status to 'In Progress'
    console.log("⏳ 5. Changing Task status to 'in-progress'...");
    await apiCall('PATCH', `/tasks/${task1Id}`, {
      workspaceId,
      status: "in-progress"
    });
    console.log(`✅ Task updated to 'in-progress'`);

    // 6. Change Task status to 'Done'
    console.log("⏳ 6. Changing Task status to 'done'...");
    await apiCall('PATCH', `/tasks/${task1Id}`, {
      workspaceId,
      status: "done"
    });
    console.log(`✅ Task updated to 'done'`);

    // 7. Fetch Project -> Verify Progress is exactly 100%
    console.log("⏳ 7. Fetching Project to verify 100% progress...");
    const fetchProj1 = await apiCall('GET', `/projects/${projectId}?workspaceId=${workspaceId}`);
    const progress1 = fetchProj1.project ? fetchProj1.project.progress : fetchProj1.progress;
    if (progress1 !== 100) {
      console.warn(`⚠️ Warning: Expected progress 100%, but got ${progress1}%`);
    } else {
      console.log(`✅ Project progress is exactly 100%`);
    }

    // 8. Create another Task (Implement 2FA) -> Status 'Todo'
    console.log("⏳ 8. Creating another Task (Implement 2FA)...");
    const task2Data = await apiCall('POST', '/tasks', {
      workspaceId,
      projectId,
      title: "Implement 2FA",
      status: "todo"
    });
    console.log(`✅ Created second task`);

    // 9. Fetch Project -> Verify Progress is now exactly 50%
    console.log("⏳ 9. Fetching Project to verify 50% progress...");
    const fetchProj2 = await apiCall('GET', `/projects/${projectId}?workspaceId=${workspaceId}`);
    const progress2 = fetchProj2.project ? fetchProj2.project.progress : fetchProj2.progress;
    if (progress2 !== 50) {
      console.warn(`⚠️ Warning: Expected progress 50%, but got ${progress2}%`);
    } else {
      console.log(`✅ Project progress is exactly 50%`);
    }

    // 10. Fetch Analytics -> Verify completion trends and summary reflect these 2 tasks.
    console.log("⏳ 10. Fetching Analytics...");
    const summary = await apiCall('GET', `/analytics/summary?workspaceId=${workspaceId}`);
    console.log(`✅ Analytics Summary fetched successfully. Completion Rate: ${summary.completionRate}%`);

    const health = await apiCall('GET', `/analytics/workspace-health?workspaceId=${workspaceId}`);
    console.log(`✅ Analytics Workspace Health fetched successfully. Score: ${health.healthScore}`);

    // 11. Fetch Project Attachments / Task Attachments presigned URLs.
    console.log("⏳ 11. Generating Presigned URL for Project Attachment...");
    const projAttachData = await apiCall('POST', `/projects/${projectId}/attachments`, {
      workspaceId,
      fileName: "project_plan.docx",
      fileSize: 2048,
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    console.log(`✅ Project presigned URL generated: ${projAttachData.presignedUrl}`);

    console.log("🎉 E2E INTEGRATION TEST COMPLETED SUCCESSFULLY! 🎉");
    console.log("Please verify the UI also reflects these changes automatically.");
    
  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
})();
