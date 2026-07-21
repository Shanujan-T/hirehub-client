import apiClient from "@/lib/api-client";
import type { DashboardData } from "@/types";

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await apiClient.get<{ dashboard: DashboardData }>(
      "/api/me/dashboard",
    );
    return data.dashboard;
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
