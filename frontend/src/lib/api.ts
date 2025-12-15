import {
  PortfolioCompany,
  Deal,
  DealStage,
  CreateCompanyData,
  UpdateCompanyData,
  Founder,
  CreateFounderData,
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
    body: JSON.stringify({ Stage: stage }),
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
