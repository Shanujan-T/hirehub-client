import apiClient from "@/lib/api-client";
import type {
  Conversation,
  ConversationDetail,
  Message,
  MessageResponse,
  SendMessagePayload,
} from "@/types";

export const conversationsService = {
  async list(): Promise<Conversation[]> {
    const { data } = await apiClient.get<{ conversations: Conversation[] }>(
      "/api/conversations",
    );
    return data.conversations;
  },

  async createForApplication(applicationId: number): Promise<Conversation> {
    const { data } = await apiClient.post<{
      conversation: Conversation;
      message: string;
    }>(`/api/applications/${applicationId}/conversation`);
    return data.conversation;
  },

  async getMessages(conversationId: number): Promise<ConversationDetail> {
    const { data } = await apiClient.get<{
      conversation: Conversation;
      messages: Message[];
    }>(`/api/conversations/${conversationId}/messages`);
    return { conversation: data.conversation, messages: data.messages };
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

  async markRead(conversationId: number): Promise<MessageResponse> {
    const { data } = await apiClient.patch<MessageResponse>(
      `/api/conversations/${conversationId}/read`,
    );
    return data;
  },

  async getAdminConversation(conversationId: number): Promise<ConversationDetail> {
    const { data } = await apiClient.get<{
      conversation: Conversation;
      messages: Message[];
    }>(`/api/conversations/${conversationId}`);
    return { conversation: data.conversation, messages: data.messages };
  },
};

export default conversationsService;
