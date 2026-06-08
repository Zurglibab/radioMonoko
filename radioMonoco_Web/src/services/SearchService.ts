import api from "./Api.ts";
import type {User} from "../context/AuthContext.tsx";
import type {Collection} from "../interfaces/Collections.types.ts";
import type {ApiShow} from "../interfaces/Shows.types";
import type {SearchResult} from "../interfaces/Search.types.ts";

const SHOW_STATIONS = [
    "FRANCEINTER",
    "FRANCECULTURE",
    "FRANCEMUSIQUE",
    //"FIP",
    "MOUV"
];

const searchUsers = async (query: string): Promise<User[]> => {
    try {
        const response = await api.get(`/user/search`, {params: { q: query },
        });

        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche d'utilisateurs:", error);
        return [];
    }
};

const searchCollection = async (
    collections: Collection[],
    query: string
): Promise<Collection[]> => {
    const lower = query.toLowerCase();

    return collections.filter((collection) => {
        const name = collection.name?.toLowerCase() ?? "";
        const description = collection.description?.toLowerCase() ?? "";

        return name.includes(lower) || description.includes(lower);
    });
};

const normalizeShowsResponse = (payload: any): ApiShow[] => {
    const rawShows = payload?.data ?? payload ?? [];

    if (!Array.isArray(rawShows)) {
        return [];
    }

    return rawShows.filter((show) => show && show.id && show.title);
};

const searchShows = async (query: string): Promise<ApiShow[]> => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
        return [];
    }

    const responses = await Promise.allSettled(
        SHOW_STATIONS.map(async (station) => {
            const response = await api.get(`/api/shows/${station}/search/${encodeURIComponent(trimmed)}`);
            return normalizeShowsResponse(response.data);
        })
    );

    const merged = responses.flatMap((result, index) => {
        if (result.status === "fulfilled") {
            return result.value;
        }

        const station = SHOW_STATIONS[index];
        const status = result.reason?.response?.status;

        if (status !== 404 && status !== 500) {
            console.warn(`Erreur recherche station ${station}:`, result.reason);
        }
        return [];
    });

    const uniqueShows = merged.filter(
        (show, index, self) =>
            index ===
            self.findIndex((candidate) => {
                const sameId = candidate.id && candidate.id === show.id;
                const sameUrl = candidate.url && candidate.url === show.url;
                return sameId || sameUrl;
            })
    );
    return uniqueShows;
};

const searchUnified = async (
    query: string,
    collectionsCache: Collection[]
): Promise<SearchResult> => {
    const trimmed = query.trim();

    if (!trimmed) {
        return {
            users: [],
            collections: [],
            shows: [],
        };
    }
    const [users, shows] = await Promise.all([
        searchUsers(trimmed).catch(() => []),
        searchShows(trimmed).catch(() => []),
    ]);

    const collections = await searchCollection(collectionsCache, trimmed);

    return {
        users,
        collections,
        shows,
    };
};

export default {searchUsers, searchCollection, searchShows, searchUnified,};