import apiClient from "@/lib/api-client";
import type { AdminAnalytics } from "@/types";

export const analyticsService = {
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const { data } = await apiClient.get<AdminAnalytics>("/api/admin/analytics");
    return data;
  },
};

export default analyticsService;
