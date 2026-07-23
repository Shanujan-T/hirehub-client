import apiClient from "@/lib/api-client";
import type {
  Application,
  CreateApplicationPayload,
  Interview,
  MessageResponse,
} from "@/types";

export interface RejectApplicationPayload {
  rejection_reason?: string;
}

export const applicationsService = {
  async list(): Promise<Application[]> {
    const { data } = await apiClient.get<{ applications: Application[] }>(
      "/api/applications",
    );
    return data.applications;
  },

  async getMy(): Promise<Application[]> {
    const { data } = await apiClient.get<{ applications: Application[] }>(
      "/api/applications/my",
    );
    return data.applications;
  },

  async getById(id: number): Promise<Application> {
    const { data } = await apiClient.get<{ application: Application }>(
      `/api/applications/${id}`,
    );
    return data.application;
  },

  async create(payload: CreateApplicationPayload): Promise<Application> {
    const { data } = await apiClient.post<{
      application: Application;
      message: string;
    }>("/api/applications", payload);
    return data.application;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/applications/${id}`,
    );
    return data;
  },

  async shortlist(id: number): Promise<Application> {
    const { data } = await apiClient.patch<{
      application: Application;
      message: string;
    }>(`/api/applications/${id}/shortlist`);
    return data.application;
  },

  async accept(id: number): Promise<Application> {
    const { data } = await apiClient.patch<{
      application: Application;
      message: string;
    }>(`/api/applications/${id}/accept`);
    return data.application;
  },

  async reject(id: number, payload?: RejectApplicationPayload): Promise<Application> {
    const { data } = await apiClient.patch<{
      application: Application;
      message: string;
    }>(`/api/applications/${id}/reject`, payload ?? {});
    return data.application;
  },

  async withdraw(id: number): Promise<Application> {
    const { data } = await apiClient.patch<{
      application: Application;
      message: string;
    }>(`/api/applications/${id}/withdraw`);
    return data.application;
  },

  async getHistory(id: number) {
    const { data } = await apiClient.get<{ history: import("@/types").ApplicationStatusLog[] }>(
      `/api/applications/${id}/history`,
    );
    return data.history;
  },

  async getInterview(applicationId: number): Promise<Interview | null> {
    const { data } = await apiClient.get<{ interview: Interview | null }>(
      `/api/applications/${applicationId}/interview`,
    );
    return data.interview;
  },

  async proposeInterview(applicationId: number, slots: string[]): Promise<Interview> {
    const { data } = await apiClient.post<{ interview: Interview; message: string }>(
      `/api/applications/${applicationId}/interview`,
      { slots },
    );
    return data.interview;
  },

  async selectInterviewSlot(interviewId: number, selectedSlot: string): Promise<Interview> {
    const { data } = await apiClient.patch<{ interview: Interview; message: string }>(
      `/api/interviews/${interviewId}/select`,
      { selected_slot: selectedSlot },
    );
    return data.interview;
  },

  async cancelInterview(interviewId: number): Promise<Interview> {
    const { data } = await apiClient.patch<{ interview: Interview; message: string }>(
      `/api/interviews/${interviewId}/cancel`,
    );
    return data.interview;
  },

  async exportCsv(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/applications/export", "applications.csv");
  },

  async exportPdf(id: number): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi(
      `/api/applications/${id}/pdf`,
      `application-${id}.pdf`,
    );
  },
};

export default applicationsService;
