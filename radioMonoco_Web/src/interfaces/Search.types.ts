export interface SearchUser{
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface SearchCollection{
    id: string;
    name: string;
    description?: string;
}

export interface SearchShow{
    id: string;
    title: string;
    description?: string;
}

export interface SearchResult {
    users: SearchUser[];
    collections: SearchCollection[];
    shows: SearchShow[];
}