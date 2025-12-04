"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioCompany } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

interface PortfolioHealthProps {
  green: PortfolioCompany[];
  yellow: PortfolioCompany[];
  red: PortfolioCompany[];
}

interface HealthSectionProps {
  companies: PortfolioCompany[];
  color: string;
  icon: LucideIcon;
  label: string;
}

const HealthSection = ({
  companies,
  color,
  icon: Icon,
  label,
}: HealthSectionProps) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <Badge variant="outline" className="ml-auto text-xs">
        {companies.length}
      </Badge>
    </div>
    <div className="space-y-2">
      {companies.map((company) => (
        <div
          key={company.id}
          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-slate-200">{company.name}</p>
            <p className="text-xs text-slate-500">{company.sector}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-300">
              {company.runwayMonths} mo
            </p>
            <p className="text-xs text-slate-500">runway</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function PortfolioHealthCard({
  green,
  yellow,
  red,
}: PortfolioHealthProps) {
  const totalCompanies = green.length + yellow.length + red.length;

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-200">
          Portfolio Health
        </h3>
        <div className="text-sm text-slate-400">{totalCompanies} Companies</div>
      </div>

      <div className="space-y-6">
        <HealthSection
          companies={green}
          color="text-emerald-400"
          icon={CheckCircle}
          label="Healthy (6+ months runway)"
        />

        <HealthSection
          companies={yellow}
          color="text-amber-400"
          icon={AlertTriangle}
          label="Watch (3-6 months runway)"
        />

        <HealthSection
          companies={red}
          color="text-red-400"
          icon={AlertCircle}
          label="Critical (<3 months runway)"
        />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex gap-2">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {green.length}
            </p>
            <p className="text-xs text-slate-500">Healthy</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-amber-400">{yellow.length}</p>
            <p className="text-xs text-slate-500">Watch</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-red-400">{red.length}</p>
            <p className="text-xs text-slate-500">Critical</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
