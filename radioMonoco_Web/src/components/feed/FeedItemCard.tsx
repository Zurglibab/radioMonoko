import type { FeedItem } from "../../interfaces/Feed.types.ts";
import {
    FiHeart,
    FiMessageCircle,
    FiPlusCircle,
    FiBookOpen,
} from "react-icons/fi";

interface FeedItemCardProps {
    item: FeedItem;
    onUserClick: (userId: string) => void;
    onCollectionClick: (collectionId: string) => void;
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

    return date.toLocaleDateString();
};

const getIcon = (type: FeedItem["type"]) => {
    switch (type) {
        case "collection_item_added":
            return <FiPlusCircle className="text-rose-400" />;
        case "content_liked":
            return <FiHeart className="text-rose-400" />;
        case "comment_posted":
            return <FiMessageCircle className="text-rose-400" />;
        default:
            return <FiBookOpen className="text-rose-400" />;
    }
};

const getActionText = (item: FeedItem) => {
    switch (item.type) {
        case "collection_item_added":
            return "a ajouté un contenu à une collection";
        case "content_liked":
            return "a aimé une critique";
        case "comment_posted":
            return "a publié une critique";
        default:
            return "a réalisé une activité";
    }
};

const FeedItemCard = ({
                          item,
                          onUserClick,
                          onCollectionClick,
                      }: FeedItemCardProps) => {
    const actorInitial = item.actor.username?.charAt(0)?.toUpperCase() || "U";

    return (
        <article className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 hover:border-rose-500/20 transition">
            <div className="flex items-start gap-4">
                <button
                    onClick={() => onUserClick(item.actor.id)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/40 to-blue-500/30 flex items-center justify-center overflow-hidden shrink-0"
                >
                    {item.actor.avatar ? (
                        <img
                            src={item.actor.avatar}
                            alt={item.actor.username}
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
                            onClick={() => onUserClick(item.actor.id)}
                            className="text-white font-bold hover:text-rose-400 transition"
                        >
                            @{item.actor.username}
                        </button>

                        <span className="text-neutral-500 text-sm">
                            {getActionText(item)}
                        </span>

                        <span className="text-neutral-600 text-sm">
                            · {formatTimeAgo(item.created_at)}
                        </span>
                    </div>

                    <div className="mt-4 bg-black/20 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
                            {getIcon(item.type)}
                            <span>
                                {item.type === "collection_item_added" && "Ajout dans une collection"}
                                {item.type === "content_liked" && "Like sur une critique"}
                                {item.type === "comment_posted" && "Nouvelle critique"}
                            </span>
                        </div>

                        {item.content && (
                            <p className="text-white font-semibold">
                                {item.content.title || "Contenu sans titre"}
                            </p>
                        )}

                        {item.collection && (
                            <button
                                onClick={() => onCollectionClick(item.collection!.id)}
                                className="mt-3 inline-flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition"
                            >
                                <FiBookOpen />
                                Collection : {item.collection.name}
                            </button>
                        )}

                        {item.comment && (
                            <p className="text-neutral-300 mt-4 leading-relaxed">
                                “{item.comment}”
                            </p>
                        )}

                        {item.note && (
                            <p className="text-neutral-500 text-sm mt-3">
                                Note : {item.note}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default FeedItemCard;