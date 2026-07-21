import apiClient from "@/lib/api-client";
import type {
  AddReactionPayload,
  Comment,
  CreateCommentPayload,
  CreatePostPayload,
  MessageResponse,
  Post,
  PostBookmark,
  PostsQueryParams,
} from "@/types";

export const postsService = {
  async list(params?: PostsQueryParams): Promise<Post[]> {
    const { data } = await apiClient.get<{ posts: Post[] }>("/api/posts", {
      params,
    });
    return data.posts;
  },

  async getById(id: number): Promise<Post> {
    const { data } = await apiClient.get<{ post: Post }>(`/api/posts/${id}`);
    return data.post;
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    const { image, ...fields } = payload;

    if (image) {
      const formData = new FormData();
      formData.append("title", fields.title);
      formData.append("body", fields.body);
      formData.append("type", fields.type ?? "discussion");
      if (fields.community_id != null) {
        formData.append("community_id", String(fields.community_id));
      }
      if (fields.job_id != null) {
        formData.append("job_id", String(fields.job_id));
      }
      if (fields.link_url) {
        formData.append("link_url", fields.link_url);
      }
      formData.append("image", image);

      const { data } = await apiClient.post<{ post: Post; message: string }>(
        "/api/posts",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.post;
    }

    const { data } = await apiClient.post<{ post: Post; message: string }>(
      "/api/posts",
      fields,
    );
    return data.post;
  },

  async uploadImage(postId: number, image: File): Promise<Post> {
    const formData = new FormData();
    formData.append("image", image);
    const { data } = await apiClient.post<{ post: Post; message: string }>(
      `/api/posts/${postId}/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.post;
  },

  async update(
    id: number,
    payload: Partial<CreatePostPayload>,
  ): Promise<Post> {
    const { data } = await apiClient.put<{ post: Post; message: string }>(
      `/api/posts/${id}`,
      payload,
    );
    return data.post;
  },

  async delete(id: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/posts/${id}`,
    );
    return data;
  },

  async getComments(postId: number): Promise<Comment[]> {
    const { data } = await apiClient.get<{ comments: Comment[] }>(
      `/api/posts/${postId}/comments`,
    );
    return data.comments;
  },

  async createComment(
    postId: number,
    payload: CreateCommentPayload,
  ): Promise<Comment> {
    const { data } = await apiClient.post<{ comment: Comment; message: string }>(
      `/api/posts/${postId}/comments`,
      payload,
    );
    return data.comment;
  },

  async deleteComment(commentId: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/comments/${commentId}`,
    );
    return data;
  },

  async addReaction(
    postId: number,
    payload: AddReactionPayload,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      `/api/posts/${postId}/reactions`,
      payload,
    );
    return data;
  },

  async removeReaction(postId: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/posts/${postId}/reactions`,
    );
    return data;
  },

  async bookmark(postId: number): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      `/api/posts/${postId}/bookmark`,
    );
    return data;
  },

  async unbookmark(postId: number): Promise<MessageResponse> {
    const { data } = await apiClient.delete<MessageResponse>(
      `/api/posts/${postId}/bookmark`,
    );
    return data;
  },

  async getMyBookmarks(): Promise<PostBookmark[]> {
    const { data } = await apiClient.get<{ bookmarks: PostBookmark[] }>(
      "/api/my/bookmarks",
    );
    return data.bookmarks;
  },
};

export default postsService;
