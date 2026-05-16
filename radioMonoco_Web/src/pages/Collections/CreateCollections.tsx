import {useState} from "react";
import {HiOutlineX} from "react-icons/hi";
import { FiLock, FiGlobe} from "react-icons/fi";

interface CreateCollectionProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit:(
        name: string,
        description: string,
        isPublic: boolean
    ) => Promise<void>;
}

const CreateCollection = ({ isOpen, onClose, onSubmit,}:CreateCollectionProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await onSubmit(name, description, isPublic);
            setName("");
            setDescription("");
            setIsPublic(false);
            onClose();
        } catch (error) {
            console.error("Failed to create collection", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg mx-4 bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
                >
                    <HiOutlineX size={22} />
                </button>

                <h2 className="text-2xl font-black text-white mb-2">
                    Créer une collection
                </h2>

                <p className="text-neutral-500 text-sm mb-8">
                    Organise ta bibliothèque en légende comme te le souhaite !
                </p>

                {/* nom */}
                <div className="mb-5">
                    <label className="text-sm text-neutral-400 mb-2 block">
                        Nom
                    </label>

                    <input
                        type="text"
                        placeholder="Ma collection"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition"
                    />
                </div>

                {/* description */}
                <div className="mb-5">
                    <label className="text-sm text-neutral-400 mb-2 block">
                        Description
                    </label>

                    <textarea
                        placeholder="Décris ta collection..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition resize-none h-28"
                    />
                </div>

                {/* public/private */}
                <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                        isPublic
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/5 bg-neutral-900"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {isPublic ? (
                            <FiGlobe className="text-emerald-400" />
                        ) : (
                            <FiLock className="text-neutral-400" />
                        )}

                        <span className="text-white text-sm">
                            {isPublic ? "Collection publique" : "Collection privée"}
                        </span>
                    </div>
                </button>

                {/* actions */}
                <div className="flex justify-end gap-3 mt-8">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition"
                    >
                        Annuler
                    </button>

                    <button
                        disabled={loading || !name}
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold transition"
                    >
                        {loading ? "Création..." : "Créer"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CreateCollection;