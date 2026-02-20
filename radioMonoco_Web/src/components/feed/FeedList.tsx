import FeedItem from "./FeedItems.tsx";

type FeedList = {
    items: any[]
}

const FeedList = ({ items }: FeedList) => {
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <FeedItem key={index} item={item} />
            ))}
        </div>
    )
}

export default FeedList