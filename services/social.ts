import apiClient from "@/lib/api-client";
import {
  applyCommunityMembership,
  applyCommunityMembershipToOne,
} from "@/lib/community-membership";
import type {
  Community,
  CommunityAnnouncement,
  CommunityMember,
  CommunitiesQueryParams,
  CreateCommunityPayload,
  CreateConversationPayload,
  CreateMentorshipPayload,
  CreateReferralPayload,
  CreateSavedSearchPayload,
  CreateSessionPayload,
  JobReferral,
  MentorsQueryParams,
  Mentorship,
  MentorshipSession,
  MentorProfile,
  Message,
  MessageResponse,
  Notification,
  NotificationsQueryParams,
  ReferralsQueryParams,
  SavedJob,
  SavedSearch,
  SendMessagePayload,
  Conversation,
  UpdateMemberRolePayload,
  UpdateReferralStatusPayload,
  UpsertMentorProfilePayload,
} from "@/types";

export const socialService = {
  // ── Saved jobs ─────────────────────────────────────────────────────────────

  async getSavedJobs(): Promise<SavedJob[]> {
    const { data } = await apiClient.get<{ saved_jobs: SavedJob[] }>(
      "/api/my/saved-jobs",
    );
    return data.saved_jobs;
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  async getNotifications(
    params?: NotificationsQueryParams,
  ): Promise<Notification[]> {
    const { data } = await apiClient.get<{ notifications: Notification[] }>(
      "/api/my/notifications",
      { params },
    );
    return data.notifications;
  },

  async markNotificationRead(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.patch<MessageResponse>(
      `/api/notifications/${id}/read`,
    );
    return data;
  },

  async markAllNotificationsRead(): Promise<MessageResponse> {
    const { data } = await apiClient.patch<MessageResponse>(
      "/api/my/notifications/read-all",
    );
    return data;
  },

  // ── Mentorship ─────────────────────────────────────────────────────────────

  async createMentorship(
    payload: CreateMentorshipPayload,
  ): Promise<Mentorship> {
    const { data } = await apiClient.post<{
      mentorship: Mentorship;
      message: string;
    }>("/api/mentorships", payload);
    return data.mentorship;
  },

  async getMyMentorships(): Promise<Mentorship[]> {
    const { data } = await apiClient.get<{ mentorships: Mentorship[] }>(
      "/api/my/mentorships",
    );
    return data.mentorships;
  },

  async discoverMentors(
    params?: MentorsQueryParams,
  ): Promise<MentorProfile[]> {
    const { data } = await apiClient.get<{ mentors: MentorProfile[] }>(
      "/api/mentors",
      { params },
    );
    return data.mentors;
  },

  async getMentorProfile(userId: number): Promise<MentorProfile> {
    const { data } = await apiClient.get<{ mentor_profile: MentorProfile }>(
      `/api/mentors/${userId}`,
    );
    return data.mentor_profile;
  },

  async upsertMentorProfile(
    payload: UpsertMentorProfilePayload,
  ): Promise<MentorProfile> {
    const { data } = await apiClient.put<{
      mentor_profile: MentorProfile;
      message: string;
    }>("/api/my/mentor-profile", payload);
    return data.mentor_profile;
  },

  async acceptMentorship(id: number): Promise<Mentorship> {
    const { data } = await apiClient.patch<{
      mentorship: Mentorship;
      message: string;
    }>(`/api/mentorships/${id}/accept`);
    return data.mentorship;
  },

  async declineMentorship(id: number): Promise<Mentorship> {
    const { data } = await apiClient.patch<{
      mentorship: Mentorship;
      message: string;
    }>(`/api/mentorships/${id}/decline`);
    return data.mentorship;
  },

  async endMentorship(id: number): Promise<Mentorship> {
    const { data } = await apiClient.patch<{
      mentorship: Mentorship;
      message: string;
    }>(`/api/mentorships/${id}/end`);
    return data.mentorship;
  },

  async createSession(
    mentorshipId: number,
    payload: CreateSessionPayload,
  ): Promise<MentorshipSession> {
    const { data } = await apiClient.post<{
      session: MentorshipSession;
      message: string;
    }>(`/api/mentorships/${mentorshipId}/sessions`, payload);
    return data.session;
  },

  async updateSession(
    mentorshipId: number,
    sessionId: number,
    payload: Partial<CreateSessionPayload & { status?: string }>,
  ): Promise<MentorshipSession> {
    const { data } = await apiClient.patch<{
      session: MentorshipSession;
      message: string;
    }>(`/api/mentorships/${mentorshipId}/sessions/${sessionId}`, payload);
    return data.session;
  },

  // ── Conversations / messages ─────────────────────────────────────────────────

  async getMyConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<{ conversations: Conversation[] }>(
      "/api/my/conversations",
    );
    return data.conversations;
  },

  async createConversation(
    payload: CreateConversationPayload,
  ): Promise<Conversation> {
    const { data } = await apiClient.post<{
      conversation: Conversation;
      message: string;
    }>("/api/conversations", payload);
    return data.conversation;
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const { data } = await apiClient.get<{ messages: Message[] }>(
      `/api/conversations/${conversationId}/messages`,
    );
    return data.messages;
  },

  async sendMessage(
    conversationId: number,
    payload: SendMessagePayload,
  ): Promise<Message> {
    const { data } = await apiClient.post<{ message_obj: Message }>(
      `/api/conversations/${conversationId}/messages`,
      payload,
    );
    return data.message_obj;
  },

  async markMessageRead(messageId: number): Promise<MessageResponse> {
    const { data } = await apiClient.patch<MessageResponse>(
      `/api/messages/${messageId}/read`,
    );
    return data;
  },

  // ── Communities ────────────────────────────────────────────────────────────

  async listCommunities(
    params?: CommunitiesQueryParams,
  ): Promise<Community[]> {
    const { data } = await apiClient.get<{ communities: Community[] }>(
      "/api/communities",
      { params },
    );
    return data.communities;
  },

  async listCommunitiesForUser(
    params?: CommunitiesQueryParams,
    authenticated = false,
  ): Promise<Community[]> {
    const [communities, joined] = await Promise.all([
      this.listCommunities(params),
      authenticated
        ? this.getMyCommunities().catch(() => [] as Community[])
        : Promise.resolve([] as Community[]),
    ]);
    return applyCommunityMembership(communities, joined);
  },

  async getMyCommunities(): Promise<Community[]> {
    const { data } = await apiClient.get<{ communities: Community[] }>(
      "/api/my/communities",
    );
    return data.communities;
  },

  async getMineCommunities(): Promise<Community[]> {
    const communities = await this.getMyCommunities();
    return communities.map((community) => ({
      ...community,
      is_member: community.is_member ?? true,
    }));
  },

  async getCommunity(id: number): Promise<Community> {
    const { data } = await apiClient.get<{ community: Community }>(
      `/api/communities/${id}`,
    );
    return data.community;
  },

  async getCommunityForUser(
    id: number,
    authenticated = false,
  ): Promise<Community> {
    const [community, joined] = await Promise.all([
      this.getCommunity(id),
      authenticated
        ? this.getMyCommunities().catch(() => [] as Community[])
        : Promise.resolve([] as Community[]),
    ]);
    return applyCommunityMembershipToOne(community, joined);
  },

  async createCommunity(payload: CreateCommunityPayload): Promise<Community> {
    const { data } = await apiClient.post<{
      community: Community;
      message: string;
    }>("/api/communities", payload);
    return data.community;
  },

  async updateCommunity(
    id: number,
    payload: Partial<CreateCommunityPayload>,
  ): Promise<Community> {
    const { data } = await apiClient.put<{
      community: Community;
      message: string;
    }>(`/api/communities/${id}`, payload);
    return data.community;
  },

  async uploadCommunityLogo(id: number, file: File): Promise<Community> {
    const formData = new FormData();
    formData.append("logo", file);
    const { data } = await apiClient.post<{ community: Community; message: string }>(
      `/api/communities/${id}/logo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.community;
  },

  async deleteCommunity(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/communities/${id}`,
    );
    return data;
  },

  async joinCommunity(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      `/api/communities/${id}/join`,
    );
    return data;
  },

  async leaveCommunity(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      `/api/communities/${id}/leave`,
    );
    return data;
  },

  async getCommunityMembers(id: number): Promise<CommunityMember[]> {
    const { data } = await apiClient.get<{ members: CommunityMember[] }>(
      `/api/communities/${id}/members`,
    );
    return data.members;
  },

  async updateMemberRole(
    communityId: number,
    userId: number,
    payload: UpdateMemberRolePayload,
  ): Promise<CommunityMember> {
    const { data } = await apiClient.patch<{
      membership: CommunityMember;
      message: string;
    }>(`/api/communities/${communityId}/members/${userId}`, payload);
    return data.membership;
  },

  async removeMember(
    communityId: number,
    userId: number,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/communities/${communityId}/members/${userId}`,
    );
    return data;
  },

  async getCommunityFeed(id: number): Promise<import("@/types").Post[]> {
    const { data } = await apiClient.get<{ posts: import("@/types").Post[] }>(
      `/api/communities/${id}/feed`,
    );
    return data.posts;
  },

  async getAnnouncements(id: number): Promise<CommunityAnnouncement[]> {
    const { data } = await apiClient.get<{
      announcements: CommunityAnnouncement[];
    }>(`/api/communities/${id}/announcements`);
    return data.announcements;
  },

  async createAnnouncement(
    communityId: number,
    payload: { title: string; body: string; is_pinned?: boolean },
  ): Promise<CommunityAnnouncement> {
    const { data } = await apiClient.post<{
      announcement: CommunityAnnouncement;
      message: string;
    }>(`/api/communities/${communityId}/announcements`, payload);
    return data.announcement;
  },

  async updateAnnouncement(
    communityId: number,
    announcementId: number,
    payload: Partial<{ title: string; body: string; is_pinned: boolean }>,
  ): Promise<CommunityAnnouncement> {
    const { data } = await apiClient.put<{
      announcement: CommunityAnnouncement;
      message: string;
    }>(
      `/api/communities/${communityId}/announcements/${announcementId}`,
      payload,
    );
    return data.announcement;
  },

  async deleteAnnouncement(
    communityId: number,
    announcementId: number,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/communities/${communityId}/announcements/${announcementId}`,
    );
    return data;
  },

  // ── Referrals ──────────────────────────────────────────────────────────────

  async listReferrals(
    params?: ReferralsQueryParams,
  ): Promise<JobReferral[]> {
    const { data } = await apiClient.get<{ referrals: JobReferral[] }>(
      "/api/referrals",
      { params },
    );
    return data.referrals;
  },

  async getMyReferrals(): Promise<JobReferral[]> {
    const { data } = await apiClient.get<{ referrals: JobReferral[] }>(
      "/api/my/referrals",
    );
    return data.referrals;
  },

  async createReferral(payload: CreateReferralPayload): Promise<JobReferral> {
    const { data } = await apiClient.post<{
      referral: JobReferral;
      message: string;
    }>("/api/referrals", payload);
    return data.referral;
  },

  async getReferral(id: number): Promise<JobReferral> {
    const { data } = await apiClient.get<{ referral: JobReferral }>(
      `/api/referrals/${id}`,
    );
    return data.referral;
  },

  async updateReferralStatus(
    id: number,
    payload: UpdateReferralStatusPayload,
  ): Promise<JobReferral> {
    const { data } = await apiClient.patch<{
      referral: JobReferral;
      message: string;
    }>(`/api/referrals/${id}/status`, payload);
    return data.referral;
  },

  // ── Saved searches ─────────────────────────────────────────────────────────

  async getSavedSearches(): Promise<SavedSearch[]> {
    const { data } = await apiClient.get<{ saved_searches: SavedSearch[] }>(
      "/api/my/saved-searches",
    );
    return data.saved_searches;
  },

  async getSavedSearch(id: number): Promise<SavedSearch> {
    const { data } = await apiClient.get<{ saved_search: SavedSearch }>(
      `/api/my/saved-searches/${id}`,
    );
    return data.saved_search;
  },

  async createSavedSearch(
    payload: CreateSavedSearchPayload,
  ): Promise<SavedSearch> {
    const { data } = await apiClient.post<{
      saved_search: SavedSearch;
      message: string;
    }>("/api/my/saved-searches", payload);
    return data.saved_search;
  },

  async updateSavedSearch(
    id: number,
    payload: Partial<CreateSavedSearchPayload>,
  ): Promise<SavedSearch> {
    const { data } = await apiClient.put<{
      saved_search: SavedSearch;
      message: string;
    }>(`/api/my/saved-searches/${id}`, payload);
    return data.saved_search;
  },

  async deleteSavedSearch(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/my/saved-searches/${id}`,
    );
    return data;
  },
};

export default socialService;
