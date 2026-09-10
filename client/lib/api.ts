const API_BASE = "http://localhost:5000/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department?: string;
  designation?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: AuthUser;
}

async function handleResponse(res: Response): Promise<AuthResponse> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function loginUser(payload: LoginPayload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
export async function submitProposal(formData: FormData, token: string) {
  const res = await fetch(`${API_BASE}/proposals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to submit proposal");
  }
  return data;
}

export interface ProposalSummary {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  researcher: { name: string; email: string; department?: string };
}

export interface ProposalDetail extends ProposalSummary {
  abstract: string;
  objectives: string;
  budget?: string;
  timeline?: string;
  coResearchers?: string[];
  attachments?: { filename: string; originalName: string }[];
  reviewDecision?: string | null;
  reviewComment?: string;
}

export async function getAssignedProposals(token: string) {
  const res = await fetch(`${API_BASE}/reviews/assigned`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch assigned proposals");
  return data.proposals as ProposalSummary[];
}

export async function getProposalDetail(id: string, token: string) {
  const res = await fetch(`${API_BASE}/reviews/proposal/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch proposal");
  return data.proposal as ProposalDetail;
}

export async function submitDecision(
  id: string,
  decision: string,
  comment: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/reviews/decide/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit decision");
  return data;
}
export interface Reviewer {
  _id: string;
  name: string;
  email: string;
  expertise?: string;
}

export interface OfficerProposal extends ProposalSummary {
  reviewer?: { _id: string; name: string; email: string } | null;
}

export async function getAllProposals(token: string) {
  const res = await fetch(`${API_BASE}/reviews/all-proposals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch proposals");
  return data.proposals as OfficerProposal[];
}

export async function getReviewers(token: string) {
  const res = await fetch(`${API_BASE}/reviews/reviewers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch reviewers");
  return data.reviewers as Reviewer[];
}

export async function assignReviewer(
  proposalId: string,
  reviewerId: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/reviews/assign/${proposalId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reviewerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to assign reviewer");
  return data;
}
export interface ContentItem {
  _id: string;
  type: "event" | "news" | "publication";
  title: string;
  description?: string;
  date?: string;
  location?: string;
  authors?: string;
  year?: string;
}

export async function getContent(type: string) {
  const res = await fetch(`${API_BASE}/content?type=${type}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch content");
  return data.items as ContentItem[];
}

export async function createContent(
  item: Partial<ContentItem>,
  token: string
) {
  const res = await fetch(`${API_BASE}/content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create content");
  return data.item as ContentItem;
}

export async function deleteContent(id: string, token: string) {
  const res = await fetch(`${API_BASE}/content/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete content");
  return data;
}
export interface NotificationItem {
  _id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(token: string) {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch notifications");
  return data as { notifications: NotificationItem[]; unreadCount: number };
}

export async function markNotificationsRead(token: string) {
  const res = await fetch(`${API_BASE}/notifications/mark-read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to mark read");
  return data;
}
export async function resubmitProposal(
  id: string,
  payload: Record<string, string>,
  token: string
) {
  const res = await fetch(`${API_BASE}/proposals/${id}/resubmit`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resubmit");
  return data;
}

export async function getMyProposalDetail(id: string, token: string) {
  const res = await fetch(`${API_BASE}/proposals/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch");
  return (data.proposals as ProposalDetail[]).find((p) => p._id === id);
}
export interface ManagedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  active: boolean;
}

export async function getAllUsers(token: string) {
  const res = await fetch(`${API_BASE}/reviews/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch users");
  return data.users as ManagedUser[];
}

export async function updateUserRole(id: string, role: string, token: string) {
  const res = await fetch(`${API_BASE}/reviews/users/${id}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update role");
  return data;
}

export async function updateUserStatus(
  id: string,
  active: boolean,
  token: string
) {
  const res = await fetch(`${API_BASE}/reviews/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ active }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update status");
  return data;
}
export async function submitAppeal(
  id: string,
  appealText: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/proposals/${id}/appeal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ appealText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit appeal");
  return data;
}

export interface AppealProposal {
  _id: string;
  title: string;
  reviewComment?: string;
  appealText?: string;
  researcher: { name: string; email: string };
  reviewer?: { name: string; email: string };
}

export async function getPendingAppeals(token: string) {
  const res = await fetch(`${API_BASE}/reviews/appeals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch appeals");
  return data.proposals as AppealProposal[];
}

export async function resolveAppeal(
  id: string,
  decision: string,
  response: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/reviews/appeals/${id}/resolve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ decision, response }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resolve appeal");
  return data;
}
export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to process request");
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to reset password");
  return data;
}
export interface FullProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  bio?: string;
}

export async function getMyProfile(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
  return data.user as FullProfile;
}

export async function updateMyProfile(
  payload: { name?: string; department?: string; bio?: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile");
  return data;
}