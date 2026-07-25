import apiClient from "@/lib/api-client";
import type { JobTemplate, MessageResponse } from "@/types";

export interface CreateJobTemplatePayload {
  name: string;
  title?: string;
  description?: string;
  category?: string;
  job_type?: string;
  experience_level?: string;
  location?: string;
  default_skills?: number[];
  skill_ids?: number[];
}

export const jobTemplatesService = {
  async list(): Promise<JobTemplate[]> {
    const { data } = await apiClient.get<{ templates: JobTemplate[] }>(
      "/api/me/job-templates",
    );
    return data.templates;
  },

  async create(payload: CreateJobTemplatePayload): Promise<JobTemplate> {
    const { data } = await apiClient.post<{
      template: JobTemplate;
      message: string;
    }>("/api/job-templates", payload);
    return data.template;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/job-templates/${id}`,
    );
    return data;
  },
};

export default jobTemplatesService;
