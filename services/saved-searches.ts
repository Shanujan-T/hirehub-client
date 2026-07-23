import apiClient from "@/lib/api-client";
import type { CreateSavedSearchPayload, MessageResponse, SavedSearch } from "@/types";

export const savedSearchesService = {
  async list(): Promise<SavedSearch[]> {
    const { data } = await apiClient.get<{ saved_searches: SavedSearch[] }>(
      "/api/my/saved-searches",
    );
    return data.saved_searches;
  },

  async create(payload: CreateSavedSearchPayload): Promise<SavedSearch> {
    const { data } = await apiClient.post<{
      saved_search: SavedSearch;
      message: string;
    }>("/api/my/saved-searches", payload);
    return data.saved_search;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/my/saved-searches/${id}`,
    );
    return data;
  },
};

export default savedSearchesService;
