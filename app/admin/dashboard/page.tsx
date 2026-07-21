"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  FileText,
  Flag,
  MessageSquare,
  Users,
} from "lucide-react";
import { AdminPageHeader, AdminShell } from "@/app/admin/_components/admin-shell";
import { LoadingState } from "@/app/_components/page-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import analyticsService from "@/services/analytics";
import { getDashboard } from "@/services/dashboard";
import { getApiErrorMessage } from "@/lib/api-client";
import { BRAND } from "@/lib/constants";
import type { AdminAnalytics, AdminDashboard } from "@/types";

const AnalyticsCharts = dynamic(
  () => import("@/app/admin/dashboard/_components/analytics-charts"),
  { ssr: false, loading: () => <LoadingState message="Loading charts..." /> },
);

const statCards = [
  { key: "users", label: "Total Users", icon: Users, href: "/admin/users", color: BRAND.blue600 },
  { key: "seekers", label: "Seekers", icon: Users, href: "/admin/users", color: BRAND.navy700 },
  { key: "employers", label: "Employers", icon: Users, href: "/admin/users", color: BRAND.purple600 },
  { key: "companies", label: "Companies", icon: Building2, href: "/admin/companies", color: BRAND.magenta500 },
  { key: "jobs", label: "Jobs", icon: Briefcase, href: "/admin/jobs", color: BRAND.orange500 },
  { key: "applications", label: "Applications", icon: FileText, href: "/admin/applications", color: BRAND.navy900 },
  { key: "posts", label: "Posts", icon: MessageSquare, href: "/admin/posts", color: BRAND.blue600 },
  { key: "open_reports", label: "Open Reports", icon: Flag, href: "/admin/reports", color: BRAND.rose500 },
] as const;

function DashboardContent() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboard(), analyticsService.getAdminAnalytics()])
      .then(([dash, stats]) => {
        if (dash.role === "admin") {
          setDashboard(dash);
          setAnalytics(stats);
        } else {
          setError("Admin dashboard data unavailable.");
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !dashboard || !analytics) {
    return (
      <p className="text-sm text-[#DA3753]" role="alert">
        {error ?? "Failed to load dashboard."}
      </p>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Admin Dashboard"
        description="Platform overview, analytics, and moderation metrics"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, href, color }) => (
          <Link key={key} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-subtle">{label}</CardTitle>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-heading">{dashboard.counts[key]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AnalyticsCharts analytics={analytics} />
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
