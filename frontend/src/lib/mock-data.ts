import { DashboardData, PortfolioCompany } from "./types";

const portfolioCompanies: PortfolioCompany[] = [
  {
    id: 1,
    name: "CloudSync AI",
    sector: "SaaS",
    amountInvested: 2000000,
    currentValuation: 8000000,
    cashRemaining: 1500000,
    monthlyBurnRate: 150000,
    runwayMonths: 10,
    healthStatus: "green",
  },
  {
    id: 2,
    name: "FinPay Solutions",
    sector: "Fintech",
    amountInvested: 3000000,
    currentValuation: 12000000,
    cashRemaining: 800000,
    monthlyBurnRate: 200000,
    runwayMonths: 4,
    healthStatus: "yellow",
  },
  {
    id: 3,
    name: "HealthTech Pro",
    sector: "BioTech",
    amountInvested: 5000000,
    currentValuation: 15000000,
    cashRemaining: 2000000,
    monthlyBurnRate: 250000,
    runwayMonths: 8,
    healthStatus: "green",
  },
  {
    id: 4,
    name: "AI Vision Labs",
    sector: "AI",
    amountInvested: 1500000,
    currentValuation: 10000000,
    cashRemaining: 600000,
    monthlyBurnRate: 180000,
    runwayMonths: 3,
    healthStatus: "yellow",
  },
  {
    id: 5,
    name: "DataVault Security",
    sector: "SaaS",
    amountInvested: 2500000,
    currentValuation: 7500000,
    cashRemaining: 250000,
    monthlyBurnRate: 200000,
    runwayMonths: 1,
    healthStatus: "red",
  },
  {
    id: 6,
    name: "NeuralNet Corp",
    sector: "AI",
    amountInvested: 4000000,
    currentValuation: 18000000,
    cashRemaining: 3000000,
    monthlyBurnRate: 300000,
    runwayMonths: 10,
    healthStatus: "green",
  },
  {
    id: 7,
    name: "CryptoLedger",
    sector: "Fintech",
    amountInvested: 1800000,
    currentValuation: 5000000,
    cashRemaining: 400000,
    monthlyBurnRate: 150000,
    runwayMonths: 2,
    healthStatus: "red",
  },
  {
    id: 8,
    name: "BioGen Therapeutics",
    sector: "BioTech",
    amountInvested: 6000000,
    currentValuation: 20000000,
    cashRemaining: 4500000,
    monthlyBurnRate: 500000,
    runwayMonths: 9,
    healthStatus: "green",
  },
];

const totalDeployed = portfolioCompanies.reduce(
  (sum, company) => sum + company.amountInvested,
  0
);
const currentValue = portfolioCompanies.reduce(
  (sum, company) => sum + company.currentValuation,
  0
);
const distributions = 0;

const moic = (currentValue + distributions) / totalDeployed;

export const mockDashboardData: DashboardData = {
  aum: {
    totalDeployed,
    currentValuation: currentValue,
    unrealizedGains: currentValue - totalDeployed,
  },
  performance: {
    irr: 28.5,
    moic,
    totalDeployed,
    currentValue,
    distributions,
  },
  sectorAllocation: [
    { sector: "SaaS", value: 4500000, percentage: 17.3, color: "#3b82f6" },
    { sector: "Fintech", value: 4800000, percentage: 18.5, color: "#8b5cf6" },
    { sector: "AI", value: 5500000, percentage: 21.2, color: "#ec4899" },
    { sector: "BioTech", value: 11000000, percentage: 42.3, color: "#10b981" },
  ],
  portfolioHealth: {
    green: portfolioCompanies.filter((c) => c.healthStatus === "green"),
    yellow: portfolioCompanies.filter((c) => c.healthStatus === "yellow"),
    red: portfolioCompanies.filter((c) => c.healthStatus === "red"),
  },
};
