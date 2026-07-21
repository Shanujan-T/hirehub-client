import apiClient from "@/lib/api-client";
import type {
  CreateInterestPayload,
  CreateSkillPayload,
  CreateUserInterestPayload,
  CreateUserSkillPayload,
  ImportResult,
  Interest,
  MessageResponse,
  Skill,
  SkillLevel,
  UserInterest,
  UserSkill,
} from "@/types";

export const catalogService = {
  // ── Skills catalog ─────────────────────────────────────────────────────────

  async listSkills(): Promise<Skill[]> {
    const { data } = await apiClient.get<{ skills: Skill[] }>("/api/skills");
    return data.skills;
  },

  async getSkill(id: number): Promise<Skill> {
    const { data } = await apiClient.get<{ skill: Skill }>(
      `/api/skills/${id}`,
    );
    return data.skill;
  },

  async createSkill(payload: CreateSkillPayload): Promise<Skill> {
    const { data } = await apiClient.post<{ skill: Skill; message: string }>(
      "/api/skills",
      payload,
    );
    return data.skill;
  },

  async updateSkill(
    id: number,
    payload: Partial<CreateSkillPayload>,
  ): Promise<Skill> {
    const { data } = await apiClient.put<{ skill: Skill; message: string }>(
      `/api/skills/${id}`,
      payload,
    );
    return data.skill;
  },

  async deleteSkill(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/skills/${id}`,
    );
    return data;
  },

  async exportSkills(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/skills/export", "skills.csv");
  },

  async importSkills(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ImportResult>(
      "/api/skills/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // ── Interests catalog ──────────────────────────────────────────────────────

  async listInterests(): Promise<Interest[]> {
    const { data } = await apiClient.get<{ interests: Interest[] }>(
      "/api/interests",
    );
    return data.interests;
  },

  async getInterest(id: number): Promise<Interest> {
    const { data } = await apiClient.get<{ interest: Interest }>(
      `/api/interests/${id}`,
    );
    return data.interest;
  },

  async createInterest(payload: CreateInterestPayload): Promise<Interest> {
    const { data } = await apiClient.post<{
      interest: Interest;
      message: string;
    }>("/api/interests", payload);
    return data.interest;
  },

  async updateInterest(
    id: number,
    payload: Partial<CreateInterestPayload>,
  ): Promise<Interest> {
    const { data } = await apiClient.put<{
      interest: Interest;
      message: string;
    }>(`/api/interests/${id}`, payload);
    return data.interest;
  },

  async deleteInterest(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/interests/${id}`,
    );
    return data;
  },

  // ── My skills ──────────────────────────────────────────────────────────────

  async listMySkills(): Promise<UserSkill[]> {
    const { data } = await apiClient.get<{ user_skills: UserSkill[] }>(
      "/api/my/skills",
    );
    return data.user_skills;
  },

  async addMySkill(payload: CreateUserSkillPayload): Promise<UserSkill> {
    const { data } = await apiClient.post<{
      user_skill: UserSkill;
      message: string;
    }>("/api/my/skills", payload);
    return data.user_skill;
  },

  async updateMySkill(
    id: number,
    payload: { level: SkillLevel },
  ): Promise<UserSkill> {
    const { data } = await apiClient.put<{
      user_skill: UserSkill;
      message: string;
    }>(`/api/my/skills/${id}`, payload);
    return data.user_skill;
  },

  async deleteMySkill(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/my/skills/${id}`,
    );
    return data;
  },

  async exportMySkills(): Promise<void> {
    const { downloadFromApi } = await import("@/lib/download");
    await downloadFromApi("/api/my/skills/export", "my-skills.csv");
  },

  async importMySkills(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ImportResult>(
      "/api/my/skills/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  // ── My interests ───────────────────────────────────────────────────────────

  async listMyInterests(): Promise<UserInterest[]> {
    const { data } = await apiClient.get<{ user_interests: UserInterest[] }>(
      "/api/my/interests",
    );
    return data.user_interests;
  },

  async addMyInterest(
    payload: CreateUserInterestPayload,
  ): Promise<UserInterest> {
    const { data } = await apiClient.post<{
      user_interest: UserInterest;
      message: string;
    }>("/api/my/interests", payload);
    return data.user_interest;
  },

  async deleteMyInterest(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/my/interests/${id}`,
    );
    return data;
  },
};

export default catalogService;
