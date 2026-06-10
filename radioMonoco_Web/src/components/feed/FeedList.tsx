import type { FeedItem } from "../../interfaces/Feed.types.ts";
import FeedItemCard from "./FeedItemCard.tsx";

interface FeedListProps {
    items: FeedItem[];
    onUserClick: (userId: string) => void;
    onCollectionClick: (collectionId: string) => void;
}

const FeedList = ({items, onUserClick, onCollectionClick,}: FeedListProps) => {
    return (
        <div className="space-y-5">
            {items.map((item) => (
                <FeedItemCard
                    key={item.id}
                    item={item}
                    onUserClick={onUserClick}
                    onCollectionClick={onCollectionClick}
                />
            ))}
        </div>
    );
};

export default FeedList;