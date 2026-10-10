const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchHealthStatus() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchDashboardStats(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function fetchDocuments(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/documents`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function fetchDocumentById(id) {
  const res = await fetch(`${BASE_URL}/documents/${id}`);
  return res.json();
}

export async function uploadDocument(file, category = 'General', workspaceId = 'knowflow-enterprise-demo') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: { 'x-workspace-id': workspaceId },
    body: formData
  });
  return res.json();
}

export async function deleteDocument(id, workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function seedSampleDocuments(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/documents/seed-samples`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': workspaceId
    }
  });
  return res.json();
}

export async function askAIQuestion({ question, sessionId, category, documentIds }, workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': workspaceId
    },
    body: JSON.stringify({ question, sessionId, category, documentIds })
  });
  return res.json();
}

export async function fetchChatSessions(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function fetchChatHistory(sessionId) {
  const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
  return res.json();
}

export async function fetchGalaxyData(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/galaxy`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function fetchAuditLogs(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/admin/logs`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return res.json();
}

export async function clearWorkspace(workspaceId = 'knowflow-enterprise-demo') {
  const res = await fetch(`${BASE_URL}/admin/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': workspaceId
    }
  });
  return res.json();
}
