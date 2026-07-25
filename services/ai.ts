import axios from "axios";
import apiClient, { setApiAuthToken } from "@/lib/api-client";
import { API_BASE_URL, TOKEN_KEY } from "@/lib/constants";
import type { Job, Skill } from "@/types";

/**
 * AI calls often exceed Next.js rewrite/proxy timeouts.
 * Prefer a direct Flask URL in the browser when configured.
 */
function resolveAiBaseUrl(): string {
  const fromPublic =
    process.env.NEXT_PUBLIC_HIREHUB_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";
  if (fromPublic) return fromPublic.replace(/\/$/, "");
  // Same-origin / rewrite fallback (dev proxy or production rewrite)
  return API_BASE_URL;
}

/** OpenRouter model calls can exceed the default 30s axios timeout. */
const AI_REQUEST_TIMEOUT_MS = 120_000;

export interface GenerateJobDescriptionResult {
  title: string;
  description: string;
  responsibilities?: string;
  suggested_skills: string[];
  matched_skills: Skill[];
  category?: string | null;
  job_type?: string;
  experience_level?: string;
  location?: string | null;
  malformed?: boolean;
  raw_text?: string;
}

export interface ParseSearchResult {
  filters: {
    q?: string;
    location?: string;
    category?: string;
    job_type?: string;
    experience_level?: string;
    status?: string;
  };
  jobs: Job[];
}

async function postAi<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const baseURL = resolveAiBaseUrl();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;

  // Keep in-memory auth in sync if present
  if (token) setApiAuthToken(token);

  const client = baseURL
    ? axios.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
        timeout: AI_REQUEST_TIMEOUT_MS,
        withCredentials: true,
      })
    : apiClient;

  const { data } = await client.post<T>(
    path,
    body,
    {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  return data;
}

export const aiService = {
  async generateResume(): Promise<string> {
    const data = await postAi<{ resume_text: string }>("/api/ai/generate-resume", {});
    return data.resume_text;
  },

  async generateJobDescription(prompt: string): Promise<GenerateJobDescriptionResult> {
    return postAi<GenerateJobDescriptionResult>("/api/ai/generate-job-description", {
      prompt,
    });
  },

  async generateCoverLetter(jobId: number): Promise<string> {
    const data = await postAi<{ cover_letter: string }>("/api/ai/generate-cover-letter", {
      job_id: jobId,
    });
    return data.cover_letter;
  },

  async summarizeCandidate(
    applicationId: number,
    force = false,
  ): Promise<{ summary: string; cached: boolean }> {
    return postAi<{ summary: string; cached: boolean }>("/api/ai/summarize-candidate", {
      application_id: applicationId,
      force,
    });
  },

  async parseSearch(query: string): Promise<ParseSearchResult> {
    return postAi<ParseSearchResult>("/api/ai/parse-search", { query });
  },
};

export default aiService;
