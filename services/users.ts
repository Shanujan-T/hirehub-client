import apiClient from "@/lib/api-client";
import type {
  CandidatesQueryParams,
  ImportResult,
  MessageResponse,
  PatchUserStatusPayload,
  User,
} from "@/types";

export const usersService = {
  async list(): Promise<User[]> {
    const { data } = await apiClient.get<{ users: User[] }>("/api/users");
    return data.users;
  },

  async getById(id: number): Promise<User> {
    const { data } = await apiClient.get<{ user: User }>(`/api/users/${id}`);
    return data.user;
  },

  async update(
    id: number,
    payload: Partial<User> & { password?: string },
  ): Promise<User> {
    const { data } = await apiClient.put<{ user: User; message: string }>(
      `/api/users/${id}`,
      payload,
    );
    return data.user;
  },

  async patchStatus(
    id: number,
    payload: PatchUserStatusPayload,
  ): Promise<User> {
    const { data } = await apiClient.patch<{ user: User; message: string }>(
      `/api/users/${id}/status`,
      payload,
    );
    return data.user;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/users/${id}`,
    );
    return data;
  },

  async exportCsv(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/users/export", "users.csv");
  },

  async importCsv(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ImportResult>(
      "/api/users/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async listCandidates(params?: CandidatesQueryParams): Promise<User[]> {
    const { data } = await apiClient.get<{ candidates: User[] }>(
      "/api/candidates",
      { params },
    );
    return data.candidates;
  },

  async getCandidate(id: number): Promise<User> {
    const { data } = await apiClient.get<{ candidate: User }>(
      `/api/candidates/${id}`,
    );
    return data.candidate;
  },

  async exportCandidatePdf(id: number): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi(
      `/api/candidates/${id}/pdf`,
      `candidate-${id}.pdf`,
    );
  },
};

export default usersService;
