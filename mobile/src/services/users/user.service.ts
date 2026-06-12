import { apiFetch } from "@/utils/apiFetch";
import { Friend } from "@/types/social";

export interface LibraryItem {
  content_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  content: {
    id: string;
    api_id: string;
    title: string;
    description: string | null;
    content_type: string;
    created_at: string;
  };
}

export interface PublicUserProfile {
  id: string;
  username: string;
  avatar?: string;
  display_name?: string;
}

export const UserService = {
  getById: (token: string, userId: string): Promise<PublicUserProfile> =>
    apiFetch<PublicUserProfile>(`/user/id/${userId}`, { token }),

  search: (token: string, query: string): Promise<Friend[]> =>
    apiFetch<Friend[]>(`/user/search?q=${encodeURIComponent(query)}`, { token }),

  getLibrary: (token: string): Promise<LibraryItem[]> =>
    apiFetch<LibraryItem[]>("/user/me/library", { token }),
};
