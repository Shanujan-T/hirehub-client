import apiClient from "@/lib/api-client";
import type {
  Company,
  CreateCompanyPayload,
  MessageResponse,
  VerifyCompanyPayload,
} from "@/types";

export const companiesService = {
  async list(): Promise<Company[]> {
    const { data } = await apiClient.get<{ companies: Company[] }>(
      "/api/companies",
    );
    return data.companies;
  },

  async getById(id: number): Promise<Company> {
    const { data } = await apiClient.get<{ company: Company }>(
      `/api/companies/${id}`,
    );
    return data.company;
  },

  async getMy(): Promise<Company> {
    const { data } = await apiClient.get<{ company: Company }>(
      "/api/my/company",
    );
    return data.company;
  },

  async create(payload: CreateCompanyPayload): Promise<Company> {
    const { data } = await apiClient.post<{ company: Company; message: string }>(
      "/api/companies",
      payload,
    );
    return data.company;
  },

  async update(
    id: number,
    payload: Partial<CreateCompanyPayload>,
  ): Promise<Company> {
    const { data } = await apiClient.put<{ company: Company; message: string }>(
      `/api/companies/${id}`,
      payload,
    );
    return data.company;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/companies/${id}`,
    );
    return data;
  },

  async verify(id: number, payload: VerifyCompanyPayload): Promise<Company> {
    const { data } = await apiClient.patch<{ company: Company; message: string }>(
      `/api/companies/${id}/verify`,
      payload,
    );
    return data.company;
  },

  async uploadLogo(id: number, logo: File): Promise<Company> {
    const formData = new FormData();
    formData.append("logo", logo);
    const { data } = await apiClient.post<{ company: Company; message: string }>(
      `/api/companies/${id}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.company;
  },

  async exportCsv(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/companies/export", "companies.csv");
  },
};

export default companiesService;
