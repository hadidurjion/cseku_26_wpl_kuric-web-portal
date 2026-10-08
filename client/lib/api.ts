const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

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
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function loginUser(payload: LoginPayload) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function submitProposal(formData: FormData, token: string) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
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
  try {
    const res = await fetch(`${API_BASE}/reviews/assigned`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch assigned proposals");
    }
    const data = await res.json();
    return data.proposals as ProposalSummary[];
  } catch (error) {
    console.error("getAssignedProposals error:", error);
    return [];
  }
}

export async function getProposalDetail(id: string, token: string) {
  try {
    const res = await fetch(`${API_BASE}/reviews/proposal/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch proposal");
    return data.proposal as ProposalDetail;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function submitDecision(
  id: string,
  decision: string,
  comment: string,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
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
  try {
    const res = await fetch(`${API_BASE}/reviews/all-proposals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch proposals");
    }
    const data = await res.json();
    return data.proposals as OfficerProposal[];
  } catch (error) {
    console.error("getAllProposals error:", error);
    return [];
  }
}

export async function getReviewers(token: string) {
  try {
    const res = await fetch(`${API_BASE}/reviews/reviewers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch reviewers");
    }
    const data = await res.json();
    return data.reviewers as Reviewer[];
  } catch (error) {
    console.error("getReviewers error:", error);
    return [];
  }
}

export async function assignReviewer(
  proposalId: string,
  reviewerId: string,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
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
  try {
    const res = await fetch(`${API_BASE}/content?type=${type}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch content");
    }
    const data = await res.json();
    return (data.items || []) as ContentItem[];
  } catch (error) {
    console.error(`getContent error for type ${type}:`, error);
    return [];
  }
}

export async function createContent(
  item: Partial<ContentItem>,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function deleteContent(id: string, token: string) {
  try {
    const res = await fetch(`${API_BASE}/content/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete content");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export interface NotificationItem {
  _id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(token: string) {
  try {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch notifications");
    }
    const data = await res.json();
    return data as { notifications: NotificationItem[]; unreadCount: number };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationsRead(token: string) {
  try {
    const res = await fetch(`${API_BASE}/notifications/mark-read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to mark read");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function resubmitProposal(
  id: string,
  payload: Record<string, string>,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function getMyProposalDetail(id: string, token: string) {
  try {
    const res = await fetch(`${API_BASE}/proposals/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch");
    }
    const data = await res.json();
    return (data.proposals as ProposalDetail[]).find((p) => p._id === id);
  } catch (error) {
    console.error("getMyProposalDetail error:", error);
    return undefined;
  }
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
  try {
    const res = await fetch(`${API_BASE}/reviews/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch users");
    }
    const data = await res.json();
    return data.users as ManagedUser[];
  } catch (error) {
    console.error("getAllUsers error:", error);
    return [];
  }
}

export async function updateUserRole(id: string, role: string, token: string) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function updateUserStatus(
  id: string,
  active: boolean,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function submitAppeal(
  id: string,
  appealText: string,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
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
  try {
    const res = await fetch(`${API_BASE}/reviews/appeals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch appeals");
    }
    const data = await res.json();
    return data.proposals as AppealProposal[];
  } catch (error) {
    console.error("getPendingAppeals error:", error);
    return [];
  }
}

export async function resolveAppeal(
  id: string,
  decision: string,
  response: string,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function forgotPassword(email: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to process request");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset password");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export interface FullProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  researchInterests?: string;
  expertise?: string;
  profileLink?: string;
}
export async function getMyProfile(token: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
    return data.user as FullProfile;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function updateMyProfile(
  payload: Partial<FullProfile>,
  token: string
) {
  try {
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
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export interface HomepageSettings {
  tagline: string;
  activeProjectsCount: string;
  publicationsCount: string;
  fundedAmount: string;
  aboutMission?: string;
  directorName?: string;
  directorTitle?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactPhone?: string;
}

export async function getHomepageSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return (data.settings || null) as HomepageSettings | null;
  } catch (error: any) {
    console.error("getHomepageSettings error:", error.message || error);
    return null;
  }
}

export async function updateHomepageSettings(
  settings: HomepageSettings,
  token: string
) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update settings");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function adminResetPassword(
  userId: string,
  newPassword: string,
  token: string
) {
  try {
    const res = await fetch(`${API_BASE}/reviews/users/${userId}/reset-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reset password");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export async function searchContent(query: string) {
  try {
    const res = await fetch(`${API_BASE}/content/search/${encodeURIComponent(query)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Search failed");
    }
    const data = await res.json();
    return (data.items || []) as ContentItem[];
  } catch (error) {
    console.error("searchContent error:", error);
    return [];
  }
}

export async function getContentItem(id: string) {
  try {
    const res = await fetch(`${API_BASE}/content/item/${id}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch item");
    return data.item as ContentItem;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export async function getInquiries(token: string) {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to fetch inquiries");
    }
    const data = await res.json();
    return (data.inquiries || []) as Inquiry[];
  } catch (error) {
    console.error("getInquiries error:", error);
    return [];
  }
}

export async function submitInquiry(payload: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to submit");
    return data;
  } catch (error: any) {
    throw new Error(error.message === "Failed to fetch" ? "Unable to connect to server" : error.message);
  }
}

export interface Installment {
  _id: string;
  label: string;
  percent: number;
  amount: number;
  dueMonths: number;
  reportRequired: boolean;
  status: string;
  reportText?: string;
  reportFile?: string;
  submittedAt?: string | null;
  releasedAt?: string | null;
}

export interface FundedProject {
  _id: string;
  fundingNumber: string;
  totalAmount: number;
  installments: Installment[];
  publicationStatus: string;
  journalName?: string;
  publicationLink?: string;
  projectStatus: string;
  createdAt: string;
  researcher: { _id: string; name: string; email: string; department?: string };
  proposal: { _id: string; title: string; abstract?: string };
}

export async function getEligibleProposals(token: string) {
  const res = await fetch(`${API_BASE}/funding/eligible-proposals`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch");
  return data.proposals;
}

export async function createFunding(
  proposalId: string,
  totalAmount: number,
  installments: { label: string; percent: number; dueMonths: number; reportRequired: boolean }[],
  token: string
) {
  const res = await fetch(`${API_BASE}/funding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proposalId, totalAmount, installments }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create funding");
  return data;
}

export async function getAllFundedProjects(token: string) {
  const res = await fetch(`${API_BASE}/funding`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch");
  return data.projects as FundedProject[];
}

export async function getFundedProject(id: string, token: string) {
  const res = await fetch(`${API_BASE}/funding/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch");
  return data.project as FundedProject;
}

export async function getMyFundedProjects(token: string) {
  const res = await fetch(`${API_BASE}/funding/mine/list`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch");
  return data.projects as FundedProject[];
}

export async function releaseInstallment(
  projectId: string,
  installmentId: string,
  token: string
) {
  const res = await fetch(
    `${API_BASE}/funding/${projectId}/installments/${installmentId}/release`,
    { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to release");
  return data;
}

export async function addInstallment(
  projectId: string,
  payload: { label: string; percent: number; dueMonths: number; reportRequired: boolean },
  token: string
) {
  const res = await fetch(`${API_BASE}/funding/${projectId}/installments`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add installment");
  return data;
}

export async function updatePublication(
  id: string,
  payload: { publicationStatus: string; journalName: string; publicationLink: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/funding/${id}/publication`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update");
  return data;
}

export async function updateFundingAmount(id: string, totalAmount: number, token: string) {
  const res = await fetch(`${API_BASE}/funding/${id}/amount`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ totalAmount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update");
  return data;
}
export async function markInquiryRead(id: string, token: string) {
  const res = await fetch(`${API_BASE}/inquiries/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed");
  return data;
}

export async function getFundingByProposal(proposalId: string, token: string) {
  const res = await fetch(`${API_BASE}/funding/by-proposal/${proposalId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Not found");
  return data.project as FundedProject;
}
export interface PublicStats {
  totalProposals: number;
  underReview: number;
  accepted: number;
  activeProjects: number;
  publications: number;
  fundedAmount: number;
}

export async function getPublicStats() {
  const res = await fetch(`${API_BASE}/settings/stats`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch stats");
  return data as PublicStats;
}
export async function uploadAvatar(file: File, token: string) {
  const fd = new FormData();
  fd.append("avatar", file);
  const res = await fetch(`${API_BASE}/auth/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload photo");
  return data.user as FullProfile;
}