import {useEffect, useState} from "react";
import AdminService from "../../services/AdminService.ts";
import type { Review } from "../../interfaces/Review.types.ts";
import {useNavigate} from "react-router-dom";

const AdminReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await AdminService.getReviews();
            setReviews(data);
        } catch (err) {
            console.error(err);
            setError("Erreur de chargelent des reviews")
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

    const handleDelete = async (id:string) => {
        try {
            await AdminService.deleteReview(id);
            fetchReviews();
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-2 rounded-full transition"
                >
                    ← Retour
                </button>
            </div>

            <h1 className="text-4xl font-bold text-white mb-8">
                Gestion des critiques
            </h1>

            {loading && (
                <p className="text-neutral-400">
                    Chargement...
                </p>
            )}

            {!loading && reviews.length === 0 && (
                <div className="bg-neutral-900/40 p-6 rounded-2xl text-center">
                    <p className="text-white font-semibold">
                        Aucune critique disponible
                    </p>

                    <p className="text-neutral-500 mt-2">
                        Les critiques créées par les utilisateurs apparaîtront ici.
                    </p>
                </div>
            )}

            {error && (
                <p className="text-red-500">
                    {error}
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

                        {review.featured && (
                            <span className="text-rose-400 text-sm">
                                Coup de cœur
                            </span>
                        )}

                        <div className="flex gap-3 mt-4">

                            <button
                                onClick={() => handleFeature(review.id, review.featured)}
                                className="bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl text-white"
                            >
                                {review.featured
                                    ? "Retirer coup de cœur"
                                    : "Mettre en avant"}
                            </button>

                            <button
                                onClick={() => handleDelete(review.id)}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-white"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}

            </div>

        </div>
    );
}
export default AdminReviews;