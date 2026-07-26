import apiClient from "@/lib/api-client";
import type { Recommendation } from "@/types";

export const recommendationsService = {
  async listMine(): Promise<Recommendation[]> {
    const { data } = await apiClient.get<{ recommendations: Recommendation[] }>(
      "/api/me/recommendations",
    );
    return data.recommendations;
  },

  async request(payload: {
    author_name: string;
    author_email: string;
    author_title?: string;
  }): Promise<{ recommendation: Recommendation; submit_url: string }> {
    const { data } = await apiClient.post<{
      recommendation: Recommendation;
      submit_url: string;
      message: string;
    }>("/api/me/recommendations/request", payload);
    return data;
  },

  async getSubmitContext(token: string): Promise<Recommendation> {
    const { data } = await apiClient.get<{ recommendation: Recommendation }>(
      `/api/recommendations/submit/${token}`,
    );
    return data.recommendation;
  },

  async submit(
    token: string,
    payload: { content: string; author_name?: string; author_title?: string },
  ): Promise<Recommendation> {
    const { data } = await apiClient.post<{ recommendation: Recommendation }>(
      `/api/recommendations/submit/${token}`,
      payload,
    );
    return data.recommendation;
  },

  async review(
    id: number,
    status: "approved" | "declined",
  ): Promise<Recommendation> {
    const { data } = await apiClient.patch<{ recommendation: Recommendation }>(
      `/api/recommendations/${id}/approve`,
      { status },
    );
    return data.recommendation;
  },
};

export default recommendationsService;
