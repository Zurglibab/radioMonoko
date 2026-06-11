import type { FeedItem } from "../../interfaces/Feed.types.ts";
import {
    FiHeart,
    FiMessageCircle,
    FiPlusCircle,
    FiBookOpen,
    FiStar,
} from "react-icons/fi";

interface FeedItemCardProps {
    item: FeedItem;
    onUserClick: (userId: string) => void;
    onCollectionClick: (collectionId: string) => void;
    onContentClick?: (item: FeedItem) => void;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l’instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;

    return date.toLocaleDateString("fr-FR");
};

const getIcon = (type: FeedItem["type"]) => {
    switch (type) {
        case "collection_item_added":
            return <FiPlusCircle className="text-rose-400" />;
        case "content_liked":
        case "review_liked":
            return <FiHeart className="text-rose-400" />;
        case "comment_posted":
        case "review_created":
            return <FiMessageCircle className="text-rose-400" />;
        case "rating_created":
            return <FiStar className="text-rose-400" />;
        default:
            return <FiBookOpen className="text-rose-400" />;
    }
};

const getActionText = (item: FeedItem) => {
    const contentTitle = item.content_title || "un contenu";
    const collectionName = item.collection_name || "une collection";

    const rating =
        item.rating ??
        (
            item.note !== null &&
            item.note !== undefined &&
            !Number.isNaN(Number(item.note))
                ? Number(item.note)
                : null
        );

    switch (item.type) {
        case "collection_item_added":
            return (
                <>
                    a ajouté{" "}
                    <span className="text-rose-400 font-semibold">
                        {contentTitle}
                    </span>{" "}
                    à{" "}
                    <span className="text-rose-400 font-semibold">
                        {collectionName}
                    </span>
                </>
            );

        case "content_liked":
            return (
                <>
                    a aimé{" "}
                    <span className="text-rose-400 font-semibold">
                        {contentTitle}
                    </span>
                </>
            );

        case "comment_posted":
            return (
                <>
                    a publié une critique sur{" "}
                    <span className="text-rose-400 font-semibold">
                        {contentTitle}
                    </span>
                    {rating ? ` avec la note ${rating}/5` : ""}
                </>
            );

        case "review_liked":
            return <>a aimé une critique</>;

        case "review_created":
            return (
                <>
                    a publié une critique sur{" "}
                    <span className="text-rose-400 font-semibold">
                        {contentTitle}
                    </span>
                </>
            );

        case "rating_created":
            return (
                <>
                    a noté{" "}
                    <span className="text-rose-400 font-semibold">
                        {contentTitle}
                    </span>{" "}
                    {rating ? `${rating}/5` : ""}
                </>
            );

        default:
            return <>a réalisé une activité</>;
    }
};

const getCardLabel = (type: FeedItem["type"]) => {
    switch (type) {
        case "content_liked":
            return "Like sur un contenu";
        case "review_liked":
            return "Like sur une critique";
        case "comment_posted":
        case "review_created":
            return "Nouvelle critique";
        case "rating_created":
            return "Nouvelle note";
        default:
            return "Activité récente";
    }
};

const FeedItemCard = ({
                          item,
                          onUserClick,
                          onCollectionClick,
                          onContentClick,
                      }: FeedItemCardProps) => {
    const actorName =
        item.actor_display_name ||
        item.actor_username ||
        "Utilisateur";

    const actorInitial = actorName.charAt(0).toUpperCase();

    const canOpenUser = Boolean(item.actor_id);
    const canOpenContent = Boolean(onContentClick && (item.content_url || item.content_id));
    const canOpenCollection = Boolean(item.collection_id);

    const rating = item.rating ?? (item.note !== null && item.note !== undefined && !Number.isNaN(Number(item.note)) ? Number(item.note) : null);

    return (
        <article className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 hover:border-rose-500/20 transition">
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    disabled={!canOpenUser}
                    onClick={() => {
                        if (item.actor_id) {
                            onUserClick(item.actor_id);
                        }
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 flex items-center justify-center overflow-hidden shrink-0 disabled:cursor-default"
                >
                    {item.actor_avatar ? (
                        <img
                            src={item.actor_avatar}
                            alt={actorName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-white font-black">
                            {actorInitial}
                        </span>
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={!canOpenUser}
                            onClick={() => {
                                if (item.actor_id) {
                                    onUserClick(item.actor_id);
                                }
                            }}
                            className="text-white font-bold hover:text-rose-400 transition disabled:hover:text-white disabled:cursor-default"
                        >
                            @{item.actor_username || actorName}
                        </button>

                        <span className="text-neutral-400 text-sm">
                            {getActionText(item)}
                        </span>

                        <span className="text-neutral-600 text-sm">
                            · {formatTimeAgo(item.created_at)}
                        </span>
                    </div>

                    <div
                        onClick={() => {
                            if (canOpenContent) {
                                onContentClick?.(item);
                            }
                        }}
                        className={`mt-4 bg-black/20 border border-white/5 rounded-2xl p-4 transition ${
                            canOpenContent
                                ? "cursor-pointer hover:border-rose-500/30 hover:bg-black/30"
                                : ""
                        }`}
                    >
                        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                            {getIcon(item.type)}
                            <span>{getCardLabel(item.type)}</span>
                        </div>

                        {(item.content_title || item.content_id) && (
                            <div>
                                <p className="text-white font-semibold">
                                    {item.content_title || "Contenu sans titre"}
                                </p>
                            </div>
                        )}

                        {canOpenCollection && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (item.collection_id) {
                                        onCollectionClick(item.collection_id);
                                    }
                                }}
                                className="mt-3 inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition"
                            >
                                <FiBookOpen />
                                Collection : {item.collection_name || "Voir la collection"}
                            </button>
                        )}
                        {item.comment && (
                            <p className="text-neutral-300 mt-4 leading-relaxed italic">
                                “{item.comment}”
                            </p>
                        )}
                        {rating && item.type !== "rating_created" && (
                            <p className="text-neutral-500 text-sm mt-3">
                                Note : {rating}/5
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default FeedItemCard;