import {useEffect, useState} from "react";
import type {Collection} from "../../interfaces/Collections.types.ts";

interface ModifyCollectionsProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (collection: Collection) => Promise<void>;
    collection: Collection | null;
}

const ModifyCollections = ({isOpen, onClose, onSubmit, collection}: ModifyCollectionsProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (collection) {
            setName(collection.name);
            setDescription(collection.description || "");
            setIsPublic(collection.is_public);
        }
    }, [collection]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!collection) return;

        await onSubmit({
            ...collection,
            name,
            description,
            is_public: isPublic
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6">

                <h1 className="text-2xl font-bold text-white mb-6">
                    Modifier la collection
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Nom
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-rose-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-rose-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />

                        <span className="text-white text-sm">
                            Collection publique
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition"
                        >
                            Sauvegarder
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifyCollections;