import apiClient from "@/lib/api-client";
import type {
  CreateJobPayload,
  ImportResult,
  Job,
  JobsQueryParams,
  MessageResponse,
  PatchJobStatusPayload,
  SavedJob,
  UpdateJobPayload,
} from "@/types";

function buildJobFormData(
  fields: Partial<Omit<CreateJobPayload, "image" | "removeImage">>,
  image: File | null,
  removeImage?: boolean,
): FormData {
  const formData = new FormData();
  if (fields.title != null) formData.append("title", fields.title);
  if (fields.description != null) formData.append("description", fields.description);
  if (fields.category != null) formData.append("category", fields.category);
  if (fields.job_type != null) formData.append("job_type", fields.job_type);
  if (fields.experience_level != null) {
    formData.append("experience_level", fields.experience_level);
  }
  if (fields.location != null) formData.append("location", fields.location);
  if (fields.salary_min != null) formData.append("salary_min", String(fields.salary_min));
  if (fields.salary_max != null) formData.append("salary_max", String(fields.salary_max));
  if (fields.deadline != null) formData.append("deadline", fields.deadline);
  fields.skill_ids?.forEach((skillId) => {
    formData.append("skill_ids", String(skillId));
  });
  if (image) formData.append("image", image);
  if (removeImage) formData.append("remove_image", "1");
  return formData;
}

export const jobsService = {
  async list(params?: JobsQueryParams): Promise<Job[]> {
    const { data } = await apiClient.get<{ jobs: Job[] }>("/api/jobs", {
      params,
    });
    return data.jobs;
  },

  async getRecommended(): Promise<Job[]> {
    const { data } = await apiClient.get<{ jobs: Job[] }>(
      "/api/jobs/recommended",
    );
    return data.jobs;
  },

  async getById(id: number): Promise<Job> {
    const { data } = await apiClient.get<{ job: Job }>(`/api/jobs/${id}`);
    return data.job;
  },

  async create(payload: CreateJobPayload): Promise<Job> {
    const { image, removeImage, ...fields } = payload;

    if (image) {
      const formData = buildJobFormData(fields, image, removeImage);
      const { data } = await apiClient.post<{ job: Job; message: string }>(
        "/api/jobs",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.job;
    }

    const { data } = await apiClient.post<{ job: Job; message: string }>(
      "/api/jobs",
      fields,
    );
    return data.job;
  },

  async update(id: number, payload: UpdateJobPayload): Promise<Job> {
    const { image, removeImage, ...fields } = payload;

    if (image || removeImage) {
      const formData = buildJobFormData(fields, image ?? null, removeImage);
      const { data } = await apiClient.put<{ job: Job; message: string }>(
        `/api/jobs/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.job;
    }

    const { data } = await apiClient.put<{ job: Job; message: string }>(
      `/api/jobs/${id}`,
      fields,
    );
    return data.job;
  },

  async uploadImage(jobId: number, image: File): Promise<Job> {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await apiClient.post<{ job: Job; message: string }>(
      `/api/jobs/${jobId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.job;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/jobs/${id}`,
    );
    return data;
  },

  async patchStatus(
    id: number,
    payload: PatchJobStatusPayload,
  ): Promise<Job> {
    const { data } = await apiClient.patch<{ job: Job; message: string }>(
      `/api/jobs/${id}/status`,
      payload,
    );
    return data.job;
  },

  async save(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      `/api/jobs/${id}/save`,
    );
    return data;
  },

  async unsave(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/jobs/${id}/save`,
    );
    return data;
  },

  async getMySaved(): Promise<SavedJob[]> {
    const { data } = await apiClient.get<{ saved_jobs: SavedJob[] }>(
      "/api/my/saved-jobs",
    );
    return data.saved_jobs;
  },

  async getApplications(jobId: number) {
    const { data } = await apiClient.get<{ applications: import("@/types").Application[] }>(
      `/api/jobs/${jobId}/applications`,
    );
    return data.applications;
  },

  async getSimilar(id: number): Promise<Job[]> {
    const { data } = await apiClient.get<{ jobs: Job[] }>(`/api/jobs/${id}/similar`);
    return data.jobs;
  },

  async exportApplicantsCsv(jobId: number): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi(
      `/api/jobs/${jobId}/applicants/export`,
      `job-${jobId}-applicants.csv`,
    );
  },

  async exportCsv(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/jobs/export", "jobs.csv");
  },

  async exportPdf(id: number): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi(`/api/jobs/${id}/pdf`, `job-${id}.pdf`);
  },

  async importCsv(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ImportResult>(
      "/api/jobs/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  async getSalaryInsights(params?: { role?: string; location?: string }) {
    const { data } = await apiClient.get<import("@/types").SalaryInsight>(
      "/api/jobs/salary-insights",
      { params },
    );
    return data;
  },
};

export default jobsService;
