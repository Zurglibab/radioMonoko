import api from "./Api.ts";
import type {
    BackendFeedItem,
    FeedApiResponse,
    FeedItem,
} from "../interfaces/Feed.types.ts";

const normalizeFeedItem = (item: BackendFeedItem): FeedItem => {
    const numericNote =
        item.note !== null && item.note !== undefined && !Number.isNaN(Number(item.note))
            ? Number(item.note)
            : null;

    return {
        id: item.id,
        type: item.type,
        created_at: item.created_at,

        actor_id: item.actor?.id,
        actor_username: item.actor?.username,
        actor_display_name: item.actor?.username,
        actor_avatar: item.actor?.avatar ?? null,

        collection_id: item.collection?.id,
        collection_name: item.collection?.name,

        content_id: item.content?.id,
        content_title: item.content?.title || "Contenu sans titre",

        comment: item.comment ?? null,
        note: item.note ?? null,
        rating: numericNote,

        review_id: item.source_review_id ?? undefined,
    };
};

const getMyFeed = async (limit = 30): Promise<FeedItem[]> => {
    try {
        const response = await api.get<FeedApiResponse | BackendFeedItem[]>(
            "/user/me/feed",
            {
                params: { limit },
            }
        );

        const payload = response.data;

        let rawItems: BackendFeedItem[] = [];

        if (Array.isArray(payload)) {
            rawItems = payload;
        } else if (
            payload &&
            typeof payload === "object" &&
            "data" in payload &&
            Array.isArray(payload.data)
        ) {
            rawItems = payload.data;
        } else {
            console.warn("Format inattendu du feed:", payload);
            return [];
        }
        return rawItems
            .map(normalizeFeedItem)
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );

    } catch (error) {
        console.error("Erreur dans getMyFeed:", error);
        return [];
    }
};

export default {getMyFeed,};