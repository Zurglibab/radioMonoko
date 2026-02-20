import { Link } from "react-router-dom"

type FeedItems = {
    item: any
}

const FeedItem = ({ item }: FeedItems) => {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4">
            <img
                src={item.user.avatar}
                alt={item.user.username}
                className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
                <p className="text-sm text-neutral-300">
                    <Link to={`/profile/${item.user.id}`} className="font-semibold text-white">
                        {item.user.username}
                    </Link>{" "}
                    {item.action === "rated" && "a noté"}
                    {item.action === "added" && "a ajouté"}{" "}
                    <Link to={`/media/${item.media.id}`} className="font-semibold text-white">
                        {item.media.title}
                    </Link>
                </p>

                {item.rating && (
                    <p className="text-yellow-400 text-sm mt-1">
                        {item.rating}/5
                    </p>
                )}

                <span className="text-xs text-neutral-500">{item.createdAt}</span>
            </div>
        </div>
    )
}

export default FeedItem
