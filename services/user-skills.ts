import apiClient from "@/lib/api-client";
import type { UserSkill } from "@/types";

export const userSkillsService = {
  async verify(id: number): Promise<UserSkill> {
    const { data } = await apiClient.patch<{ user_skill: UserSkill; message: string }>(
      `/api/user-skills/${id}/verify`,
    );
    return data.user_skill;
  },
};

export default userSkillsService;
