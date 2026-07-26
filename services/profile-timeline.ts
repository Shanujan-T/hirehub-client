import apiClient from "@/lib/api-client";
import type { Education, Experience, MessageResponse } from "@/types";

export const profileTimelineService = {
  async listExperience(): Promise<Experience[]> {
    const { data } = await apiClient.get<{ experiences: Experience[] }>(
      "/api/me/experience",
    );
    return data.experiences;
  },

  async createExperience(
    payload: Omit<Experience, "id" | "user_id" | "created_at">,
  ): Promise<Experience> {
    const { data } = await apiClient.post<{ experience: Experience }>(
      "/api/me/experience",
      payload,
    );
    return data.experience;
  },

  async updateExperience(
    id: number,
    payload: Partial<Omit<Experience, "id" | "user_id" | "created_at">>,
  ): Promise<Experience> {
    const { data } = await apiClient.patch<{ experience: Experience }>(
      `/api/me/experience/${id}`,
      payload,
    );
    return data.experience;
  },

  async deleteExperience(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/me/experience/${id}`,
    );
    return data;
  },

  async listEducation(): Promise<Education[]> {
    const { data } = await apiClient.get<{ educations: Education[] }>(
      "/api/me/education",
    );
    return data.educations;
  },

  async createEducation(
    payload: Omit<Education, "id" | "user_id" | "created_at">,
  ): Promise<Education> {
    const { data } = await apiClient.post<{ education: Education }>(
      "/api/me/education",
      payload,
    );
    return data.education;
  },

  async updateEducation(
    id: number,
    payload: Partial<Omit<Education, "id" | "user_id" | "created_at">>,
  ): Promise<Education> {
    const { data } = await apiClient.patch<{ education: Education }>(
      `/api/me/education/${id}`,
      payload,
    );
    return data.education;
  },

  async deleteEducation(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/me/education/${id}`,
    );
    return data;
  },
};

export default profileTimelineService;
