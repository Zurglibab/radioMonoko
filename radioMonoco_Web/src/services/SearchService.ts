import api from "./Api.ts";
import type {User} from "../context/AuthContext.tsx";
import type {Collection} from "../interfaces/Collections.types.ts";

export interface SearchResult {
    users: User[];
    collections: Collection[];
    shows: Show[];
}

export interface Show {
    id: string;
    title: string;
    diffusion: any[];
    taxonomies: any[];
}

const searchUsers = async (query:string): Promise<User[]> => {
    try {
        const response = await api.get(`/user/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error);
        return [];
    }
};

const searchCollection = async (collections: Collection[], query:string): Promise<Collection[]> => {
    const lower = query.toLowerCase();
    return collections.filter(collection => collection.name.toLowerCase().includes(lower) || collection.description?.toLowerCase().includes(lower)
    );
};

const searchShows = async (station: string, query: string): Promise<Show[]> => {
    try {
        const response = await api.get(`/api/shows/${station}/search/${query}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche de shows:", error);
        return [];
    }
};

const searchUnified = async (query:string, collectionsCache:Collection[]): Promise<SearchResult> => {
    const trimmed = query.trim();
    if (!trimmed) {
        return {users: [], collections: [], shows: []};
    }
    const [users] = await Promise.all([
        searchUsers(trimmed).catch(() => []),
    ]);

    const collections = await searchCollection(collectionsCache, trimmed);
    //const shows = await searchShows("monaco", trimmed).catch(() => []);
    return {users, collections, shows:[]};
};

export default { searchUsers, searchCollection, searchShows, searchUnified };

