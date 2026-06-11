import type { CommentItemProps } from "../../interfaces/Props.types";
import { useState, memo } from "react";
import ReportButton from "../utils/ReportButton.tsx";
import { HiPaperAirplane, HiHandThumbUp, HiHandThumbDown, HiTrash } from "react-icons/hi2";
import NotificationsService from "../../services/NotificationsService.ts";
import { useTranslation } from "react-i18next";
import UsersService from "../../services/UsersService.ts";
interface EnhancedCommentItemProps extends CommentItemProps {
    onLikeInteraction: (reviewId: string, actionType: "like" | "dislike" | "remove") => Promise<void>;
}

export const CommentItem = memo(({
                                     comment,
                                     usersCache,
                                     currentUser,
                                     isLoggedIn,
                                     theme,
                                     onPostReply,
                                     onDeleteReview,
                                     onLikeInteraction
                                 }: EnhancedCommentItemProps) => {
    const { t } = useTranslation();
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    const cachedUser = usersCache[comment.user_id];
    const authorName = cachedUser?.display_name || cachedUser?.username || `${t("radio.listener")} ${comment.user_id ? String(comment.user_id).slice(-4) : t("radio.anonymous")}`;

    const sendNotification = async (targetUserId: string, type: "like" | "dislike" | "reply", contentPreview: string | null | undefined) => {
        if (targetUserId === currentUser?.id) return;
        const senderName = currentUser?.display_name || currentUser?.username || "Un utilisateur";
        const safePreview = (contentPreview || "Aucun contenu").toString();

        const user = await UsersService.getUserById(targetUserId);
        if (!user) {
            console.error("Utilisateur cible introuvable pour la notification");
            return;
        }

        const messages = {
            like: `${senderName} a aimé votre commentaire : "${safePreview.slice(0, 30)}..."`,
            dislike: `${senderName} a réagi négativement à votre commentaire : "${safePreview.slice(0, 30)}..."`,
            reply: `${senderName} a répondu à votre commentaire : "${safePreview.slice(0, 30)}..."`
        };
        if(!user.notifications_email){
            try {
                await NotificationsService.createNotification({
                    user_id: targetUserId,
                    type: type,
                    message: messages[type],
                    is_read: false
                });
            } catch (error) {
                console.error("Erreur notification:", error);
            }
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        await onPostReply(replyText.trim(), comment.id);
        await sendNotification(comment.user_id, "reply", replyText);
        setReplyText("");
        setReplyingToId(null);
    };

    const clickLike = async (commentData: any, type: "like" | "dislike") => {
        if (!isLoggedIn || !currentUser?.id) return;

        if (commentData.userChoice === type) {
            onLikeInteraction(commentData.id, "remove");
        } else {
            await sendNotification(commentData.user_id, type, commentData.comment);
            onLikeInteraction(commentData.id, type);
        }
    };

    return (
        <div className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all duration-300 ${theme === 'dark' ? 'bg-white/[0.01] border-white/5 hover:border-white/10' : 'bg-white border-neutral-200/70 shadow-sm hover:shadow-md'}`}>
            <div className="flex gap-4 items-start group/item w-full relative">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-neutral-100'}`}>
                    {cachedUser?.avatar ? (
                        <img
                            src={cachedUser.avatar}
                            alt={authorName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                            {authorName.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>{authorName}</span>
                        {comment.user_id === currentUser?.id && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md">Vous</span>
                        )}
                        <span className={`text-[9px] font-medium opacity-40 ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : t("radio.recently")}
                        </span>
                    </div>
                    <p className={`text-xs leading-relaxed font-normal ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>{comment.comment}</p>

                    <div className="flex items-center gap-5 pt-1.5 select-none">
                        {isLoggedIn && (
                            <button
                                onClick={() => {
                                    setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                    setReplyText("");
                                }}
                                className={`text-[10px] uppercase tracking-wider hover:underline transition-all ${replyingToId === comment.id ? 'text-rose-500' : theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                            >
                                {replyingToId === comment.id ? t("common.cancel") : t("radio.reply")}
                            </button>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => clickLike(comment, "like")}
                                disabled={!isLoggedIn}
                                className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200 
                                ${comment.userChoice === 'like'
                                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-500 font-black shadow-sm scale-105 ring-2 ring-emerald-500/20'
                                    : theme === 'dark'
                                        ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/30'
                                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:border-emerald-500/30'}`}
                            >
                                <HiHandThumbUp size={13} className={`transition-transform duration-200 ${comment.userChoice === 'like' ? "scale-110 rotate-[-10deg]" : ""}`} />
                                <span>{comment.likesCount ?? 0}</span>
                            </button>

                            <button
                                onClick={() => clickLike(comment, "dislike")}
                                disabled={!isLoggedIn}
                                className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200
                                ${comment.userChoice === 'dislike'
                                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-500 font-black shadow-sm scale-105 ring-2 ring-amber-500/20'
                                    : theme === 'dark'
                                        ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-amber-400 hover:border-amber-500/30'
                                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-amber-600 hover:border-amber-500/30'}`}
                            >
                                <HiHandThumbDown size={13} className={`transition-transform duration-200 ${comment.userChoice === 'dislike' ? "scale-110 rotate-[10deg]" : ""}`} />
                                <span>{comment.dislikesCount ?? 0}</span>
                            </button>

                            {isLoggedIn && currentUser?.id && String(comment.user_id) !== String(currentUser.id) && (
                                <ReportButton
                                    type="review"
                                    targetId={comment.id}
                                    targetLabel={
                                        typeof comment.comment === "string" && comment.comment.trim()
                                            ? `"${comment.comment.slice(0, 60)}..."`
                                            : "Critique utilisateur"
                                    }
                                    compact
                                />
                            )}

                            {isLoggedIn && comment.user_id === currentUser?.id && (
                                <button
                                    onClick={() => onDeleteReview(comment.id)}
                                    className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200 
                                    ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-rose-500 hover:border-rose-500/30' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-500/30'}`}
                                >
                                    <HiTrash size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {replyingToId === comment.id && (
                <form onSubmit={handleReplySubmit} className="flex gap-3 pl-8 animate-fadeIn">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t("radio.replyTo", { name: authorName })}
                        className={`flex-1 h-10 px-4 border rounded-xl text-xs focus:outline-none transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/10 text-white focus:border-white/20' : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-400'}`}
                        autoFocus
                    />
                    <button type="submit" disabled={!replyText.trim()} className={`h-10 px-4 rounded-xl transition-all flex items-center justify-center ${replyText.trim() ? 'bg-rose-500 text-white shadow-sm' : 'bg-neutral-300 dark:bg-white/5 text-neutral-400 cursor-not-allowed'}`}>
                        <HiPaperAirplane size={14} />
                    </button>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="flex flex-col gap-4 pl-8 border-l-2 border-neutral-200 dark:border-white/5 mt-1">
                    {comment.replies.map((reply: any) => {
                        const replyUser = usersCache[reply.user_id];
                        const replyAuthorName = replyUser ? (replyUser.display_name || replyUser.username) : `Auditeur ${reply.user_id ? reply.user_id.slice(-4) : "Anonyme"}`;
                        return (
                            <div key={reply.id} className="flex gap-3 items-start group/item w-full relative">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-neutral-100'}`}>
                                    {replyUser?.avatar ? (
                                        <img
                                            src={replyUser.avatar}
                                            alt={replyAuthorName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className={theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}>
                                            {replyAuthorName.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-neutral-800'}`}>{replyAuthorName}</span>
                                            {reply.user_id === currentUser?.id && (
                                                <span className="text-[8px] font-black uppercase tracking-wide bg-rose-500/10 text-rose-500 px-1 py-0.2 rounded">Vous</span>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-medium ${theme === 'dark' ? 'opacity-30' : 'text-neutral-400'}`}>
                                            {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : t("radio.recently")}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed font-normal ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>{reply.comment}</p>

                                    <div className="flex items-center gap-4 pt-1 select-none">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    if (reply.userChoice === "like") onLikeInteraction(reply.id, "remove");
                                                    else onLikeInteraction(reply.id, "like");
                                                }}
                                                disabled={!isLoggedIn}
                                                className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200 
                                                    ${reply.userChoice === 'like'
                                                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-500 font-black shadow-sm scale-105 ring-2 ring-emerald-500/20'
                                                    : theme === 'dark'
                                                        ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/30'
                                                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:border-emerald-500/30'}`}
                                            >
                                                <HiHandThumbUp size={13} className={reply.userChoice === 'like' ? "scale-110" : ""} />
                                                <span>{reply.likesCount ?? 0}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (reply.userChoice === "dislike") onLikeInteraction(reply.id, "remove");
                                                    else onLikeInteraction(reply.id, "dislike");
                                                }}
                                                disabled={!isLoggedIn}
                                                className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200
                                                    ${reply.userChoice === 'dislike'
                                                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-500 font-black shadow-sm scale-105 ring-2 ring-amber-500/20'
                                                    : theme === 'dark'
                                                        ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-amber-400 hover:border-amber-500/30'
                                                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-amber-600 hover:border-amber-500/30'}`}
                                            >
                                                <HiHandThumbDown size={13} className={reply.userChoice === 'dislike' ? "scale-110" : ""} />
                                                <span>{reply.dislikesCount ?? 0}</span>
                                            </button>
                                            {isLoggedIn && currentUser?.id && String(reply.user_id) !== String(currentUser.id) && (
                                                <ReportButton
                                                    type="review"
                                                    targetId={reply.id}
                                                    targetLabel={
                                                        typeof reply.comment === "string" && reply.comment.trim()
                                                            ? `"${reply.comment.slice(0, 60)}..."`
                                                            : "Réponse utilisateur"
                                                    }
                                                    compact
                                                />
                                            )}
                                            {isLoggedIn && currentUser?.id && String(reply.user_id) === String(currentUser.id) && (
                                                <button
                                                    onClick={() => onDeleteReview(reply.id, comment.id)}
                                                    className={`h-7 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all duration-200 
                                                    ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-rose-500 hover:border-rose-500/30' : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-rose-600 hover:border-rose-500/30'}`}
                                                >
                                                    <HiTrash size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
});