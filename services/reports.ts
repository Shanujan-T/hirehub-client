import apiClient from "@/lib/api-client";
import type {
  CreateReportPayload,
  MessageResponse,
  Report,
  ReportsQueryParams,
  ResolveReportPayload,
} from "@/types";

export const reportsService = {
  async create(payload: CreateReportPayload): Promise<Report> {
    const { data } = await apiClient.post<{ report: Report; message: string }>(
      "/api/reports",
      payload,
    );
    return data.report;
  },

  async list(params?: ReportsQueryParams): Promise<Report[]> {
    const { data } = await apiClient.get<{ reports: Report[] }>(
      "/api/reports",
      { params },
    );
    return data.reports;
  },

  async getById(id: number): Promise<Report> {
    const { data } = await apiClient.get<{ report: Report }>(
      `/api/reports/${id}`,
    );
    return data.report;
  },

  async resolve(
    id: number,
    payload: ResolveReportPayload,
  ): Promise<Report> {
    const { data } = await apiClient.patch<{ report: Report; message: string }>(
      `/api/reports/${id}/resolve`,
      payload,
    );
    return data.report;
  },
};

export default reportsService;
