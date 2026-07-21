"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { Badge } from "@/components/ui/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import companiesService from "@/services/companies";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Company } from "@/types";

function CompanyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const fetchCompany = useCallback(async () => {
    if (Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await companiesService.getById(id);
      setCompany(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  async function handleVerify() {
    if (!company) return;
    setVerifying(true);
    try {
      const updated = await companiesService.verify(company.id, {
        is_verified: !company.is_verified,
      });
      setCompany(updated);
      toast.success(updated.is_verified ? "Company verified" : "Verification removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  }

  async function handleDelete() {
    if (!company || !confirm("Delete this company?")) return;
    try {
      await companiesService.delete(company.id);
      toast.success("Company deleted");
      router.push("/admin/companies");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading) return <LoadingState message="Loading company..." />;
  if (!company) return <p className="text-sm text-[#DA3753]">Company not found.</p>;

  return (
    <>
      <Link
        href="/admin/companies"
        className="text-subtle mb-6 inline-flex items-center gap-1 text-sm hover:text-[#0C44B7]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>
      <AdminPageHeader
        title={company.name}
        actions={
          <>
            <Link
              href={`/admin/companies/${company.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <Button size="sm" loading={verifying} onClick={handleVerify}>
              {company.is_verified ? "Revoke Verification" : "Verify Company"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <Badge variant={company.is_verified ? "success" : "warning"}>
            {company.is_verified ? "Verified" : "Pending verification"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Industry</p>
            <p className="text-heading">{company.industry ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Location</p>
            <p className="text-heading">{company.location ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Website</p>
            <p className="text-heading">
              {company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="text-[#0C44B7] hover:underline">
                  {company.website}
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-subtle">Created</p>
            <p className="text-heading">{formatDate(company.created_at)}</p>
          </div>
          {company.description ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-subtle">Description</p>
              <p className="text-heading whitespace-pre-wrap">{company.description}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminCompanyDetailPage() {
  return (
    <AdminShell>
      <CompanyDetailContent />
    </AdminShell>
  );
}
