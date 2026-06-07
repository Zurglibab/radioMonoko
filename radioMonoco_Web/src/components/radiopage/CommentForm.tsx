import {memo, useState} from "react";
import type {CommentFormProps} from "../../interfaces/Props.types.ts";
import {HiPaperAirplane} from "react-icons/hi2";

export const CommentForm = memo(({ dbContentId, theme, onPostReview }: CommentFormProps) => {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        await onPostReview(text.trim());
        setText("");
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={!dbContentId || submitting}
                placeholder="Écrire un message public sur ce salon..."
                className={`w-full h-14 border rounded-2xl pl-5 pr-16 focus:outline-none transition-all duration-300 text-sm ${theme === "dark" ? "bg-white/[0.02] border-white/10 text-white focus:border-white/20 focus:bg-white/[0.04]" : "bg-white border-neutral-200 text-neutral-800 focus:border-neutral-400 focus:bg-neutral-50 shadow-sm"} ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <button type="submit" disabled={!text.trim() || submitting} className={`absolute right-2.5 top-2.5 bottom-2.5 px-4 rounded-xl transition-all flex items-center justify-center ${text.trim() && !submitting ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600 active:scale-95' : theme === 'dark' ? 'bg-white/5 text-white/20' : 'bg-neutral-100 text-neutral-400'}`}>
                <HiPaperAirplane size={15} />
            </button>
        </form>
    );
});