import apiClient from "@/lib/api-client";
import type { QuizResult, QuizSubmitPayload, Skill, SkillQuizQuestion } from "@/types";

export const quizService = {
  async getQuiz(skillId: number): Promise<{
    skill: Skill;
    questions: SkillQuizQuestion[];
  }> {
    const { data } = await apiClient.get<{
      skill: Skill;
      questions: SkillQuizQuestion[];
    }>(`/api/skills/${skillId}/quiz`);
    return data;
  },

  async submit(skillId: number, payload: QuizSubmitPayload): Promise<QuizResult> {
    const { data } = await apiClient.post<QuizResult>(
      `/api/skills/${skillId}/quiz/submit`,
      payload,
    );
    return data;
  },
};

export default quizService;
