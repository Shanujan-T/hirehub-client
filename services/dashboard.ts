import apiClient from "@/lib/api-client";
import type { ActivityItem, DashboardData, SeekerStats } from "@/types";

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await apiClient.get<{ dashboard: DashboardData }>(
      "/api/me/dashboard",
    );
    return data.dashboard;
  },

  async getStats(): Promise<SeekerStats> {
    const { data } = await apiClient.get<{ stats: SeekerStats }>("/api/me/stats");
    return data.stats;
  },

  async getActivity(): Promise<ActivityItem[]> {
    const { data } = await apiClient.get<{ activity: ActivityItem[] }>(
      "/api/me/activity",
    );
    return data.activity;
  },

  async exportPdf(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/me/dashboard/pdf", "dashboard.pdf");
  },
};

export async function getDashboard(): Promise<DashboardData> {
  return dashboardService.get();
}

export default dashboardService;
