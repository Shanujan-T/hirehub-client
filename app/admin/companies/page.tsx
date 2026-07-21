"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  AdminShell,
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/app/admin/_components/admin-shell";
import { EmptyState, LoadingState } from "@/app/_components/page-states";
import { ExportButton } from "@/components/export-button";
import { Badge } from "@/components/ui/shared";
import { buttonVariants } from "@/components/ui/button";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Company } from "@/types";

function CompaniesListContent() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await companiesService.list();
      setCompanies(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <>
      <AdminPageHeader
        title="Companies"
        description="Review and verify employer organizations"
        actions={
          <ExportButton label="Export CSV" onExport={() => companiesService.exportCsv()} />
        }
      />

      {loading ? (
        <LoadingState message="Loading companies..." />
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies found" />
      ) : (
        <AdminTable headers={["Name", "Industry", "Location", "Verified", "Created", ""]}>
          {companies.map((company) => (
            <AdminTableRow
              key={company.id}
              onClick={() => router.push(`/admin/companies/${company.id}`)}
            >
              <AdminTableCell className="font-medium">{company.name}</AdminTableCell>
              <AdminTableCell>{company.industry ?? "—"}</AdminTableCell>
              <AdminTableCell>{company.location ?? "—"}</AdminTableCell>
              <AdminTableCell>
                <Badge variant={company.is_verified ? "success" : "warning"}>
                  {company.is_verified ? "Verified" : "Pending"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>{formatDate(company.created_at)}</AdminTableCell>
              <AdminTableCell>
                <Link
                  href={`/admin/companies/${company.id}/edit`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </>
  );
}

export default function AdminCompaniesPage() {
  return (
    <AdminShell>
      <CompaniesListContent />
    </AdminShell>
  );
}
