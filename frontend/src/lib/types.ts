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
  monthlyRevenue: number;
  runwayMonths: number;
  healthStatus: "green" | "yellow" | "red";
  roundStage?: string;
  investedAt?: string;
  founders?: Founder[];
  updatesNotificationsEnabled?: boolean;
}

export interface Founder {
  id: number;
  name: string;
  email: string;
  role: string;
  linkedInUrl?: string;
  companyId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFounderData {
  name: string;
  email: string;
  role: string;
  linkedInUrl?: string;
}

export type UpdateFounderData = Partial<CreateFounderData>;

export interface CreateCompanyData {
  name: string;
  sector: string;
  amountInvested: number;
  currentValuation: number;
  roundStage: string;
  investedAt: string;
  cashRemaining: number;
  monthlyBurnRate: number;
  monthlyRevenue: number;
}

export type UpdateCompanyData = Partial<CreateCompanyData>;

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
  organizationId: number;
  organizationName?: string;
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

export type LossReason =
  | "passed"
  | "valuation_too_high"
  | "competitor_won"
  | "founder_declined"
  | "deal_fell_through"
  | "other";

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
  // Archive fields
  lossReason?: LossReason;
  archivedAt?: string;
  convertedCompanyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyUpdate {
  id: number;
  companyId: number;
  mrr: string;
  arr: string;
  cashInBank: string;
  burnRate: string;
  newCustomers: number;
  churnRate: string;
  reportMonth: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyUpdateData {
  mrr: number;
  arr: number;
  cashInBank: number;
  burnRate: number;
  newCustomers?: number;
  churnRate?: number;
  reportMonth: string;
  notes?: string;
}

export type UpdateMonthlyUpdateData = Partial<CreateMonthlyUpdateData>;

export interface MissingUpdateInfo {
  id: number;
  name: string;
  sector: string;
  lastUpdateDate: string | null;
  daysSinceUpdate: number;
}

// Admin types
export interface UserWithDetails extends User {
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export interface InviteUserData {
  email: string;
  name: string;
  role?: "admin" | "viewer";
}

export interface UpdateUserData {
  name?: string;
  role?: "admin" | "viewer";
}

// Team assignment types
export type TeamRole = "lead" | "analyst" | "observer";

export interface TeamMember {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  role: TeamRole;
  createdAt: string;
}

export interface AddTeamMemberData {
  userId: number;
  role?: TeamRole;
}
