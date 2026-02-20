import FeedList from "../components/feed/FeedList.tsx";

const feedData = [
    {
        id: 1,
        user: {
            id: 10,
            username: "rafae",
            avatar: "https://i.pravatar.cc/40?img=1",
        },
        action: "rated",
        media: {
            id: "radio-123",
            title: "Le 7/9 – France Inter",
        },
        rating: 5,
        createdAt: "2h",
    },
    {
        id: 2,
        user: {
            id: 12,
            username: "alex",
            avatar: "https://i.pravatar.cc/40?img=2",
        },
        action: "added",
        media: {
            id: "radio-456",
            title: "Affaires Sensibles",
        },
        createdAt: "5h",
    },
]

const Feed = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Feed</h1>
            <FeedList items={feedData} />
        </div>
    )
}

export default Feed
