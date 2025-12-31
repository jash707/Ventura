"use client";

import { PortfolioCompany } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CompaniesTableProps {
  companies: PortfolioCompany[];
  onEdit?: (company: PortfolioCompany) => void;
  onDelete?: (company: PortfolioCompany) => void;
}

type SortField = "name" | "sector" | "amountInvested" | "runwayMonths";
type SortDirection = "asc" | "desc";

// Sort icon component
function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="h-4 w-4 ml-1" />
  ) : (
    <ArrowDown className="h-4 w-4 ml-1" />
  );
}

export function CompaniesTable({
  companies,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { formatCurrency } = useCurrency();

  // Get health badge styling
  const getHealthBadge = (status: string) => {
    const styles = {
      green:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      yellow:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };

    const labels = {
      green: "Healthy",
      yellow: "Watch",
      red: "Critical",
    };

    return {
      className: styles[status as keyof typeof styles] || styles.green,
      label: labels[status as keyof typeof labels] || status,
    };
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [companies, searchTerm, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Search companies by name or sector..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-100 dark:bg-slate-800/50"
        />
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800/50">
              <tr>
                <th
                  className="table-header cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Company
                    <SortIcon
                      field="name"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort("sector")}
                >
                  <div className="flex items-center">
                    Sector
                    <SortIcon
                      field="sector"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </div>
                </th>
                <th
                  className="table-header cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort("amountInvested")}
                >
                  <div className="flex items-center">
                    Investment
                    <SortIcon
                      field="amountInvested"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </div>
                </th>
                <th className="table-header">Current Value</th>
                <th className="table-header">Monthly Revenue</th>
                <th
                  className="table-header cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort("runwayMonths")}
                >
                  <div className="flex items-center">
                    Runway
                    <SortIcon
                      field="runwayMonths"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </div>
                </th>
                <th className="table-header">Health</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAndSortedCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {searchTerm
                      ? "No companies found matching your search."
                      : "No portfolio companies yet."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedCompanies.map((company) => {
                  const healthBadge = getHealthBadge(company.healthStatus);
                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/portfolio/${company.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {company.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {company.sector}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-900 dark:text-white">
                          {formatCurrency(company.amountInvested)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-slate-900 dark:text-white">
                          {formatCurrency(company.currentValuation)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatCurrency(company.monthlyRevenue || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {company.runwayMonths} months
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={healthBadge.className}
                          variant="outline"
                        >
                          {healthBadge.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(company);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit company"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(company);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete company"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {filteredAndSortedCompanies.length > 0 && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredAndSortedCompanies.length} of {companies.length}{" "}
          {companies.length === 1 ? "company" : "companies"}
        </div>
      )}
    </div>
  );
}
