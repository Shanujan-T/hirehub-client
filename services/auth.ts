import apiClient from "@/lib/api-client";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  ProfileResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  NotificationPreferencesPayload,
  UpdateProfilePayload,
  User,
} from "@/types";

export const authService = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      "/api/auth/register",
      payload,
    );
    return data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/auth/login",
      payload,
    );
    return data;
  },

  async verify2fa(payload: {
    temp_token: string;
    code: string;
  }): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/auth/verify-2fa",
      payload,
    );
    return data;
  },

  async toggle2fa(payload: {
    enabled: boolean;
    password?: string;
  }): Promise<User> {
    const { data } = await apiClient.patch<{ user: User; message: string }>(
      "/api/me/2fa",
      payload,
    );
    return data.user;
  },

  async exportMyData(format: "json" | "csv" = "json"): Promise<void> {
    if (format === "csv") {
      const { downloadFromApi } = await import("@/lib/download");
      await downloadFromApi("/api/me/export?format=csv", "my-hirehub-data.csv");
      return;
    }
    const { data } = await apiClient.get<Record<string, unknown>>(
      "/api/me/export",
      { params: { format: "json" } },
    );
    const { downloadBlob } = await import("@/lib/download");
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "my-hirehub-data.json");
  },

  async logout(): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      "/api/auth/logout",
    );
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ProfileResponse>("/api/auth/profile");
    return data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.put<ProfileResponse & MessageResponse>(
      "/api/auth/profile",
      payload,
    );
    return data.user;
  },

  async uploadResume(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{ user: User; resume_url: string; message: string }>(
      "/api/me/resume",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.user;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await apiClient.post<{ user: User; message: string }>(
      "/api/me/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.user;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<MessageResponse & { reset_token?: string; expires_at?: string }> {
    const { data } = await apiClient.post<
      MessageResponse & { reset_token?: string; expires_at?: string }
    >("/api/auth/forgot-password", payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      "/api/auth/reset-password",
      payload,
    );
    return data;
  },

  async updateNotificationPreferences(
    payload: NotificationPreferencesPayload,
  ): Promise<User> {
    const { data } = await apiClient.patch<{ user: User; message: string }>(
      "/api/me/notification-preferences",
      payload,
    );
    return data.user;
  },
};

export default authService;
