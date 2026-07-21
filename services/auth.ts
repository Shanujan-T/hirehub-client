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
};

export default authService;
