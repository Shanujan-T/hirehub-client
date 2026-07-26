import apiClient from "@/lib/api-client";
import type { Connection, MessageResponse } from "@/types";

export const connectionsService = {
  async request(recipientId: number): Promise<Connection> {
    const { data } = await apiClient.post<{ connection: Connection }>(
      "/api/connections/request",
      { recipient_id: recipientId },
    );
    return data.connection;
  },

  async accept(id: number): Promise<Connection> {
    const { data } = await apiClient.patch<{ connection: Connection }>(
      `/api/connections/${id}/accept`,
    );
    return data.connection;
  },

  async decline(id: number): Promise<Connection> {
    const { data } = await apiClient.patch<{ connection: Connection }>(
      `/api/connections/${id}/decline`,
    );
    return data.connection;
  },

  async remove(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/connections/${id}`,
    );
    return data;
  },

  async list(): Promise<Connection[]> {
    const { data } = await apiClient.get<{ connections: Connection[] }>(
      "/api/me/connections",
    );
    return data.connections;
  },

  async listRequests(): Promise<{
    incoming: Connection[];
    outgoing: Connection[];
  }> {
    const { data } = await apiClient.get<{
      incoming: Connection[];
      outgoing: Connection[];
    }>("/api/me/connection-requests");
    return data;
  },
};

export default connectionsService;
