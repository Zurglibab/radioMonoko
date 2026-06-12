import api from "./Api.ts";
import type { User } from "../interfaces/Users.types.ts";
import type {Collection} from "../interfaces/Collections.types.ts";
import type {ApiShow} from "../interfaces/Shows.types";
import type {SearchResult, SearchFilters} from "../interfaces/Search.types.ts";
import ShowsService from "./ShowsService.ts";

const SHOW_STATIONS = [
    "FRANCEINTER",
    "FRANCECULTURE",
    "FRANCEMUSIQUE",
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

const normalizeText = (value?: string | null): string => {
    return (value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

const enrichShowsWithDetails = async (shows: ApiShow[]): Promise<ApiShow[]> => {
    const enrichedResults = await Promise.allSettled(
        shows.map(async (show) => {
            if (!show.url) {
                return show;
            }

            const detailedShow = await ShowsService.getShowByUrl(show.url);

            return detailedShow ?? show;
        })
    );

    return enrichedResults.map((result, index) => {
        if (result.status === "fulfilled") {
            return result.value;
        }

        return shows[index];
    });
};

const getFullShowSearchText = (show: ApiShow): string => {
    const taxonomiesText = (show.taxonomies ?? [])
        .map((taxonomy: any) => {
            return [
                taxonomy.id,
                taxonomy.title,
                taxonomy.name,
                taxonomy.label,
                taxonomy.type,
                taxonomy.path,
                taxonomy.slug,
            ]
                .filter(Boolean)
                .join(" ");
        })
        .join(" ");

    const diffusionsText = (show.diffusions ?? [])
        .map((diffusion: any) => {
            const personalitiesText = (diffusion.personalities ?? [])
                .map((personality: any) => {
                    return [
                        personality.info,
                        personality.relation,
                        personality.node?.name,
                        personality.name,
                    ]
                        .filter(Boolean)
                        .join(" ");
                })
                .join(" ");

            return [
                diffusion.title,
                diffusion.parentTitle,
                diffusion.publishedDate,
                diffusion.date,
                diffusion.created_at,
                diffusion.updated_at,
                diffusion.podcastEpisode?.title,
                personalitiesText,
            ]
                .filter(Boolean)
                .join(" ");
        })
        .join(" ");

    return [
        show.id,
        show.title,
        show.url,
        show.standFirst,
        taxonomiesText,
        diffusionsText,
    ]
        .filter(Boolean)
        .join(" ");
};

const getShowYears = (show: ApiShow): string[] => {
    return (show.diffusions ?? [])
        .map((diffusion: any) => {
            const date =
                diffusion.publishedDate ||
                diffusion.date ||
                diffusion.created_at ||
                diffusion.updated_at;

            if (!date) return null;

            return new Date(date).getFullYear().toString();
        })
        .filter(Boolean) as string[];
};

const filterShows = (shows: ApiShow[], filters?: SearchFilters): ApiShow[] => {
    const genre = normalizeText(filters?.genre);
    const year = normalizeText(filters?.year);
    const author = normalizeText(filters?.author);

    if (!genre && !year && !author) {
        return shows;
    }

    return shows.filter((show) => {
        const fullText = normalizeText(getFullShowSearchText(show));
        const showYears = getShowYears(show);
        const matchGenre = !genre || fullText.includes(genre);
        const matchAuthor = !author || fullText.includes(author);
        const matchYear = !year || showYears.includes(year);

        return matchGenre && matchAuthor && matchYear;
    });
};


const searchShows = async (query: string, filters?: SearchFilters): Promise<ApiShow[]> => {
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

        if (status !== 404 && status !== 500) {console.warn(`Erreur recherche station ${station}:`, result.reason);}
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
    const hasFilters =
        !!filters?.genre?.trim() ||
        !!filters?.year?.trim() ||
        !!filters?.author?.trim();

    if (!hasFilters) {
        return uniqueShows;
    }

    const enrichedShows = await enrichShowsWithDetails(uniqueShows);

    return filterShows(enrichedShows, filters);
};

const searchUnified = async (query: string, collectionsCache: Collection[], filters?:SearchFilters): Promise<SearchResult> => {
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
        searchShows(trimmed, filters).catch(() => []),
    ]);

    const collections = await searchCollection(collectionsCache, trimmed);

    return {
        users,
        collections,
        shows,
    };
};

export default {searchUsers, searchCollection, searchShows, searchUnified,};