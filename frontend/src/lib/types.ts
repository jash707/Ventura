export interface Investment {
  id: number;
  startupName: string;
  amountInvested: number;
  currentValuation: number;
  roundStage: string;
  investedAt: string;
  sector: string;
}

export interface PortfolioCompany {
  id: number;
  name: string;
  sector: string;
  amountInvested: number;
  currentValuation: number;
  cashRemaining: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  healthStatus: "green" | "yellow" | "red";
}

export interface PerformanceMetrics {
  irr: number; // Internal Rate of Return (%)
  moic: number; // Multiple on Invested Capital
  totalDeployed: number;
  currentValue: number;
  distributions: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DashboardData {
  aum: {
    totalDeployed: number;
    currentValuation: number;
    unrealizedGains: number;
  };
  performance: PerformanceMetrics;
  sectorAllocation: SectorAllocation[];
  portfolioHealth: {
    green: PortfolioCompany[];
    yellow: PortfolioCompany[];
    red: PortfolioCompany[];
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "viewer";
}

export interface AuthResponse {
  user: User;
}

export type DealStage =
  | "incoming"
  | "screening"
  | "due_diligence"
  | "term_sheet"
  | "closed"
  | "lost";

export interface Deal {
  id: number;
  companyName: string;
  sector: string;
  stage: DealStage;
  requestedAmount: string;
  valuation: string;
  roundStage: string; // "Seed", "Series A", etc.
  teamScore: number; // 1-10
  productScore: number; // 1-10
  marketScore: number; // 1-10
  tractionScore: number; // 1-10
  totalScore: number; // Calculated sum
  founderName: string;
  founderEmail: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
