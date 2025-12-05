import { PortfolioCompany } from "./types";

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
