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