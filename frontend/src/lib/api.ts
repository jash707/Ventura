import {
  PortfolioCompany,
  Deal,
  DealStage,
  CreateCompanyData,
  UpdateCompanyData,
  Founder,
  CreateFounderData,
  MonthlyUpdate,
  CreateMonthlyUpdateData,
  MissingUpdateInfo,
  UserWithDetails,
  AuditLogResponse,
  InviteUserData,
  UpdateUserData,
  TeamMember,
  AddTeamMemberData,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface DashboardData {
  aum: {
    totalDeployed: string;
    currentValuation: string;
    unrealizedGains: string;
  };
  performance: {
    irr: number;
    moic: string;
    totalDeployed: string;
    currentValue: string;
    distributions: number;
  };
  sectorAllocation: Array<{
    sector: string;
    value: string;
    percentage: number;
  }>;
  portfolioHealth: {
    green: Array<PortfolioCompany>;
    yellow: Array<PortfolioCompany>;
    red: Array<PortfolioCompany>;
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    credentials: "include", // Include cookies for authentication
  });

  if (response.status === 401) {
    // Redirect to login if unauthorized
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  return response.json();
}

// Dashboard History Types
export interface PortfolioHistoryPoint {
  date: string;
  totalInvested: string;
  currentValue: string;
  companyCount: number;
}

export interface InvestmentEvent {
  date: string;
  companyName: string;
  sector: string;
  amount: string;
  roundStage: string;
}

export interface SectorComparisonData {
  sector: string;
  totalInvested: string;
  currentValue: string;
  moic: string;
  companyCount: number;
}

export interface DashboardHistoryData {
  portfolioHistory: PortfolioHistoryPoint[];
  investmentTimeline: InvestmentEvent[];
  sectorComparison: SectorComparisonData[];
}

export async function fetchDashboardHistory(): Promise<DashboardHistoryData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/history`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard history: ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchPortfolioCompanies(): Promise<PortfolioCompany[]> {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/companies`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch portfolio companies: ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchCompanyById(id: string): Promise<PortfolioCompany> {
  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/companies/${id}`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 404) {
    throw new Error("Company not found");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch company: ${response.statusText}`);
  }

  return response.json();
}

export async function createCompany(
  data: CreateCompanyData
): Promise<PortfolioCompany> {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create company");
  }

  return response.json();
}

export async function updateCompany(
  id: number,
  data: UpdateCompanyData
): Promise<PortfolioCompany> {
  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/companies/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 404) {
    throw new Error("Company not found");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update company");
  }

  return response.json();
}

export async function deleteCompany(id: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/companies/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 404) {
    throw new Error("Company not found");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete company");
  }
}

// Backend response type (PascalCase from Go)
interface BackendDeal {
  ID: number;
  CompanyName: string;
  Sector: string;
  Stage: DealStage;
  RequestedAmount: string;
  Valuation: string;
  RoundStage: string;
  TeamScore: number;
  ProductScore: number;
  MarketScore: number;
  TractionScore: number;
  TotalScore: number;
  FounderName: string;
  FounderEmail: string;
  Notes: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// Helper function to transform backend PascalCase to frontend camelCase
function transformDeal(backendDeal: BackendDeal): Deal {
  return {
    id: backendDeal.ID,
    companyName: backendDeal.CompanyName,
    sector: backendDeal.Sector,
    stage: backendDeal.Stage,
    requestedAmount: backendDeal.RequestedAmount,
    valuation: backendDeal.Valuation,
    roundStage: backendDeal.RoundStage,
    teamScore: backendDeal.TeamScore,
    productScore: backendDeal.ProductScore,
    marketScore: backendDeal.MarketScore,
    tractionScore: backendDeal.TractionScore,
    totalScore: backendDeal.TotalScore,
    founderName: backendDeal.FounderName,
    founderEmail: backendDeal.FounderEmail,
    notes: backendDeal.Notes,
    createdAt: backendDeal.CreatedAt,
    updatedAt: backendDeal.UpdatedAt,
  };
}

export async function fetchDeals(): Promise<Deal[]> {
  const response = await fetch(`${API_BASE_URL}/api/deals`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch deals: ${response.statusText}`);
  }

  const data = await response.json();
  return data.map(transformDeal);
}

export async function updateDealStage(
  id: number,
  stage: DealStage
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/deals/${id}/stage`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ stage: stage }),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to update deal stage: ${response.statusText}`);
  }
}

// Founder API functions

export async function fetchFoundersByCompany(
  companyId: number
): Promise<Founder[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/founders`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch founders: ${response.statusText}`);
  }

  return response.json();
}

export async function createFounder(
  companyId: number,
  data: CreateFounderData
): Promise<Founder> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/founders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create founder");
  }

  return response.json();
}

export async function updateFounder(
  id: number,
  data: CreateFounderData
): Promise<Founder> {
  const response = await fetch(`${API_BASE_URL}/api/founders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update founder");
  }

  return response.json();
}

export async function deleteFounder(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/founders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete founder");
  }
}

// Monthly Update API functions

export async function fetchMonthlyUpdatesByCompany(
  companyId: number
): Promise<MonthlyUpdate[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/updates`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch monthly updates: ${response.statusText}`);
  }

  return response.json();
}

export async function createMonthlyUpdate(
  companyId: number,
  data: CreateMonthlyUpdateData
): Promise<MonthlyUpdate> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/updates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create monthly update");
  }

  return response.json();
}

export async function updateMonthlyUpdate(
  id: number,
  data: CreateMonthlyUpdateData
): Promise<MonthlyUpdate> {
  const response = await fetch(`${API_BASE_URL}/api/monthly-updates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update monthly update");
  }

  return response.json();
}

export async function deleteMonthlyUpdate(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/monthly-updates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete monthly update");
  }
}

// Missing Updates / Notifications

export async function fetchMissingUpdates(): Promise<MissingUpdateInfo[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/missing-updates`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch missing updates");
  }

  return response.json();
}

export async function toggleCompanyNotifications(
  companyId: number,
  enabled: boolean
): Promise<{ updatesNotificationsEnabled: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/companies/${companyId}/notifications`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ enabled }),
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle notifications");
  }

  return response.json();
}

// ============================================
// Admin API Functions
// ============================================

export async function fetchUsers(): Promise<UserWithDetails[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: Admin access required");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json();
}

export async function updateUser(
  id: number,
  data: UpdateUserData
): Promise<UserWithDetails> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: Admin access required");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: Admin access required");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
}

export async function inviteUser(
  data: InviteUserData
): Promise<{ user: UserWithDetails; tempPassword: string }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: Admin access required");
  }

  if (response.status === 409) {
    throw new Error("User with this email already exists");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to invite user");
  }

  return response.json();
}

export async function fetchAuditLogs(
  page = 1,
  limit = 50,
  filters?: { userId?: number; entity?: string; action?: string }
): Promise<AuditLogResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.userId) params.append("userId", filters.userId.toString());
  if (filters?.entity) params.append("entity", filters.entity);
  if (filters?.action) params.append("action", filters.action);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/audit-logs?${params}`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden: Admin access required");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
  }

  return response.json();
}

// ============================================
// Team Assignment API Functions
// ============================================

export async function fetchCompanyTeam(
  companyId: number
): Promise<TeamMember[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/team`,
    {
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch team: ${response.statusText}`);
  }

  return response.json();
}

export async function addTeamMember(
  companyId: number,
  data: AddTeamMemberData
): Promise<TeamMember> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/team`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 409) {
    throw new Error("User is already assigned to this company");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add team member");
  }

  return response.json();
}

export async function removeTeamMember(
  companyId: number,
  userId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/companies/${companyId}/team/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove team member");
  }
}

// ============================================
// Profile API Functions
// ============================================

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface UpdateProfileData {
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface InviteCode {
  id: number;
  code: string;
  organizationId: number;
  createdById: number;
  usedById?: number;
  expiresAt: string;
  createdAt: string;
  createdBy?: { name: string; email: string };
}

export async function updateProfile(
  data: UpdateProfileData
): Promise<{
  id: number;
  email: string;
  name: string;
  role: string;
  organizationId: number;
  organizationName?: string;
}> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to change password");
  }
}

export async function fetchOrganization(): Promise<Organization> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/organization`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch organization");
  }

  return response.json();
}

export async function createInviteCode(): Promise<{
  code: string;
  expiresAt: string;
}> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/invites`, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create invite code");
  }

  return response.json();
}

export async function fetchInviteCodes(): Promise<InviteCode[]> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/invites`, {
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch invite codes");
  }

  return response.json();
}
