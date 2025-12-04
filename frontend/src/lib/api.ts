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
  const response = await fetch(`${API_BASE_URL}/api/dashboard`);

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  return response.json();
}
