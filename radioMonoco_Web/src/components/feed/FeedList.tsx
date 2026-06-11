import type { FeedItem } from "../../interfaces/Feed.types.ts";
import FeedItemCard from "./FeedItemCard.tsx";

interface FeedListProps {
    items: FeedItem[];
    onUserClick: (userId: string) => void;
    onCollectionClick: (collectionId: string) => void;
    onContentClick?: (item: FeedItem) => void;
}

const FeedList = ({items, onUserClick, onCollectionClick,onContentClick}: FeedListProps) => {
    return (
        <div className="space-y-5">
            {items.map((item) => (
                <FeedItemCard
                    key={item.id}
                    item={item}
                    onUserClick={onUserClick}
                    onCollectionClick={onCollectionClick}
                    onContentClick={onContentClick}
                />
            ))}
        </div>
    );
};

export default FeedList;