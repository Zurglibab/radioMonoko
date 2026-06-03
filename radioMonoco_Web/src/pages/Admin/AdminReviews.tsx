import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import type { Review } from "../../interfaces/Review.types.ts";

const AdminReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await AdminService.getReviews()
            setReviews(data);
        } catch (err) {
            console.error("Erreur lors de la récupération des avis :", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFeature = async (id:string, featured:boolean) => {
        try {
            await AdminService.featureReview(id, !featured);
            fetchReviews();
        } catch (err) {
            console.error(" Erreur lors de la modifcation :", err);
        }
    };

    return (
        <div className="p-8">

            <h1 className="text-4xl font-bold text-white mb-8">
                Gestion des avis
            </h1>

            {loading && (
                <p className="text-neutral-400">
                    Chargement...
                </p>
            )}

            <div className="space-y-4">

                {reviews.map((review) => (

                    <div
                        key={review.id}
                        className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
                    >
                        <p className="text-white mb-4">
                            {review.content}
                        </p>

                        <button
                            onClick={() =>
                                handleFeature(
                                    review.id,
                                    review.featured
                                )
                            }
                            className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-white"
                        >
                            {review.featured
                                ? "Retirer des coups de cœur"
                                : "Mettre en avant"}
                        </button>
                    </div>

                ))}

            </div>

        </div>
    );
}
export default AdminReviews;