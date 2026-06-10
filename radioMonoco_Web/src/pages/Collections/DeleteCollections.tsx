import {useState} from "react";
import type {Collection} from "../../interfaces/Collections.types.ts";
import {useTranslation} from "react-i18next";

interface DeleteCollectionsProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (id: string) => Promise<void>;
    collection: Collection | null;
}

const DeleteCollections = ({ isOpen, onClose, onSubmit, collection }: DeleteCollectionsProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const {t} = useTranslation();
    if (!isOpen || !collection) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onSubmit(collection.id);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la suppression de la collection:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">

                <h2 className="text-2xl font-bold text-white mb-4">
                    {t("collections.deleteModal.title")}
                </h2>

                <p className="text-neutral-400 mb-6">
                    {t("collections.deleteModal.confirmText")}
                    <span className="text-white font-semibold">
                        {" "}{collection.name}
                    </span> ?
                </p>

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
                    >
                        {t("collections.deleteModal.cancel")}
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50"
                    >
                        {isDeleting ? t("collections.deleteModal.deleting") : t("collections.deleteModal.submit")}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default DeleteCollections;