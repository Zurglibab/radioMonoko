import { useState, memo } from "react";
import ReportButton from "../utils/ReportButton.tsx";
import { HiPaperAirplane, HiHandThumbUp, HiHandThumbDown, HiTrash, HiPencil } from "react-icons/hi2";
import NotificationsService from "../../services/NotificationsService.ts";
import { useTranslation } from "react-i18next";
import UsersService from "../../services/UsersService.ts";
import type { EnhancedCommentItemProps } from "../../interfaces/Props.types";
import {
    likeActive, dislikeActive, dislikeHover, likeHover, reactionIdle, btnCancel, btnDelete, btnEdit, btnSave, btnReply,
    btnMd, btnBase, btnSm
} from "./CommentItemProps"

export const CommentItem = memo(({
                                     comment,
                                     usersCache,
                                     currentUser,
                                     isLoggedIn,
                                     theme,
                                     onPostReply,
                                     onDeleteReview,
                                     onLikeInteraction,
                                     onUpdateReview
                                 }: EnhancedCommentItemProps) => {
    const { t } = useTranslation();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    const [loadingUpdate, setLoadingUpdate] = useState<string | null>(null);
    const [loadingReply, setLoadingReply] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
    const [loadingReaction, setLoadingReaction] = useState<string | null>(null);

    const cachedUser = usersCache[comment.user_id];
    const authorName =
        cachedUser?.display_name ||
        cachedUser?.username ||
        `${t("radio.listener")} ${comment.user_id ? String(comment.user_id).slice(-4) : t("radio.anonymous")}`;

    const sendNotification = async (targetUserId: string, type: "like" | "dislike" | "reply", contentPreview: string | null | undefined) => {
        if (targetUserId === currentUser?.id) return;
        const senderName = currentUser?.display_name || currentUser?.username || t("radio.user", "Un utilisateur");
        const safePreview = (contentPreview || t("radio.noContent", "Aucun contenu")).toString();
        const user = await UsersService.getUserById(targetUserId);
        if (!user) return;
        const messages = {
            like: `${senderName} ${t("radio.notifLike", { preview: safePreview.slice(0, 30) })}`,
            dislike: `${senderName} ${t("radio.notifDislike", { preview: safePreview.slice(0, 30) })}`,
            reply: `${senderName} ${t("radio.notifReply", { preview: safePreview.slice(0, 30) })}`,
        };
        if (!user.notifications_email) {
            try { await NotificationsService.createNotification({ user_id: targetUserId, type, message: messages[type], is_read: false }); }
            catch (error) { console.error("Erreur notification:", error); }
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setLoadingReply(true);
        const result = await onPostReply(replyText.trim(), comment.id);
        if (result !== null && result !== undefined) await sendNotification(comment.user_id, "reply", replyText);
        setReplyText("");
        setIsReplying(false);
        setLoadingReply(false);
    };

    const clickLike = async (commentData: any, type: "like" | "dislike") => {
        if (!isLoggedIn || !currentUser?.id || loadingReaction) return;
        setLoadingReaction(commentData.id);
        if (commentData.userChoice === type) await onLikeInteraction(commentData.id, "remove");
        else {
            await sendNotification(commentData.user_id, type, commentData.comment);
            await onLikeInteraction(commentData.id, type);
        }
        setLoadingReaction(null);
    };

    const isDark = theme === "dark";

    return (
        <div className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all duration-300 ${isDark ? "bg-white/[0.01] border-white/5 hover:border-white/10" : "bg-white border-neutral-200/70 shadow-sm hover:shadow-md"}`}>
            <div className="flex gap-4 items-start w-full">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
                    {cachedUser?.avatar
                        ? <img src={cachedUser.avatar} alt={authorName} className="w-full h-full object-cover" />
                        : <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>{authorName.slice(0, 2).toUpperCase()}</span>
                    }
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDark ? "text-white" : "text-neutral-800"}`}>{authorName}</span>
                        {comment.user_id === currentUser?.id && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md">{t("radio.you")}</span>
                        )}
                    </div>

                    {editingId === comment.id ? (
                        <div className="flex flex-col gap-2 w-full">
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100 border-neutral-200"}`}
                />
                            <div className="flex gap-2">
                                <button
                                    disabled={loadingUpdate === comment.id}
                                    onClick={async () => {
                                        setLoadingUpdate(comment.id);
                                        await onUpdateReview(comment.id, { comment: editText });
                                        setLoadingUpdate(null);
                                        setEditingId(null);
                                    }}
                                    className={btnSave(loadingUpdate === comment.id)}
                                >
                                    {loadingUpdate === comment.id ? "…" : t("common.save")}
                                </button>
                                <button onClick={() => setEditingId(null)} className={btnCancel(theme)}>
                                    {t("common.cancel")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>{comment.comment}</p>
                    )}

                    <div className="flex items-center gap-2 pt-0.5 select-none flex-wrap">
                        <button
                            onClick={() => clickLike(comment, "like")}
                            disabled={!isLoggedIn || loadingReaction === comment.id}
                            className={`${btnBase} ${btnMd} ${comment.userChoice === "like" ? likeActive : `${reactionIdle(theme)} ${likeHover}`}`}
                        >
                            <HiHandThumbUp size={14} />
                            <span>{loadingReaction === comment.id ? "…" : comment.likesCount ?? 0}</span>
                        </button>

                        <button
                            onClick={() => clickLike(comment, "dislike")}
                            disabled={!isLoggedIn || loadingReaction === comment.id}
                            className={`${btnBase} ${btnMd} ${comment.userChoice === "dislike" ? dislikeActive : `${reactionIdle(theme)} ${dislikeHover}`}`}
                        >
                            <HiHandThumbDown size={14} />
                            <span>{loadingReaction === comment.id ? "…" : comment.dislikesCount ?? 0}</span>
                        </button>

                        {isLoggedIn && (
                            <button
                                onClick={() => { setIsReplying(!isReplying); setReplyText(""); }}
                                className={btnReply(isReplying, theme)}
                            >
                                {isReplying ? t("common.cancel") : t("radio.reply")}
                            </button>
                        )}

                        {isLoggedIn && currentUser?.id && String(comment.user_id) !== String(currentUser.id) && (
                            <ReportButton
                                type="review"
                                targetId={comment.id}
                                targetLabel={
                                    typeof comment.comment === "string" && comment.comment.trim()
                                        ? `"${comment.comment.slice(0, 60)}..."`
                                        : t("radio.userComment", "Commentaire utilisateur")
                                }
                                compact
                            />
                        )}

                        {isLoggedIn && comment.user_id === currentUser?.id && !editingId && (
                            <button onClick={() => { setEditText(comment.comment); setEditingId(comment.id); }} className={btnEdit(theme)}>
                                <HiPencil size={12} />
                                {t("common.edit")}
                            </button>
                        )}
                        {isLoggedIn && comment.user_id === currentUser?.id && (
                            <button
                                onClick={async () => { setLoadingDelete(comment.id); await onDeleteReview(comment.id); setLoadingDelete(null); }}
                                className={btnDelete(theme)}
                            >
                                {loadingDelete === comment.id ? "…" : <HiTrash size={13} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isReplying && (
                <form onSubmit={handleReplySubmit} className="flex gap-3 pl-12 animate-fadeIn">
                    <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={t("radio.replyTo", { name: authorName })} className={`flex-1 h-9 px-4 border rounded-xl text-xs ${isDark ? "bg-white/[0.02] border-white/10" : "bg-neutral-50"}`} autoFocus />
                    <button type="submit" disabled={!replyText.trim() || loadingReply} className={`${btnBase} h-9 px-4 rounded-xl ${replyText.trim() ? "bg-rose-500 text-white" : "bg-neutral-300"}`}>
                        {loadingReply ? "…" : <HiPaperAirplane size={14} />}
                    </button>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="flex flex-col gap-4 pl-12 border-l-2 border-neutral-200 dark:border-white/5 mt-1">
                    {comment.replies.map((reply: any) => {
                        const replyUser = usersCache[reply.user_id];
                        const replyAuthorName = replyUser
                            ? (replyUser.display_name || replyUser.username)
                            : `${t("radio.listener")} ${reply.user_id ? reply.user_id.slice(-4) : t("radio.anonymous")}`;
                        const isOwnReply = isLoggedIn && currentUser?.id && String(reply.user_id) === String(currentUser.id);

                        return (
                            <div key={reply.id} className="flex gap-3 items-start w-full">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
                                    {replyUser?.avatar
                                        ? <img src={replyUser.avatar} alt={replyAuthorName} className="w-full h-full object-cover" />
                                        : <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>{replyAuthorName.slice(0, 2).toUpperCase()}</span>
                                    }
                                </div>

                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${isDark ? "text-white" : "text-neutral-800"}`}>{replyAuthorName}</span>
                                        {isOwnReply && <span className="text-[8px] font-black uppercase tracking-wide bg-rose-500/10 text-rose-500 px-1 py-0.5 rounded">{t("radio.you")}</span>}
                                    </div>

                                    {editingId === reply.id ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className={`w-full p-2 rounded-xl border text-xs ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-neutral-100 border-neutral-200"}`}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={loadingUpdate === reply.id}
                                                    onClick={async () => {
                                                        setLoadingUpdate(reply.id);
                                                        await onUpdateReview(reply.id, { comment: editText });
                                                        setLoadingUpdate(null);
                                                        setEditingId(null);
                                                    }}
                                                    className={btnSave(loadingUpdate === reply.id)}
                                                >
                                                    {loadingUpdate === reply.id ? "…" : t("common.save")}
                                                </button>
                                                <button onClick={() => setEditingId(null)} className={btnCancel(theme)}>{t("common.cancel")}</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>{reply.comment}</p>
                                    )}

                                    <div className="flex items-center gap-2 pt-0.5 select-none flex-wrap">
                                        <button
                                            onClick={() => clickLike(reply, "like")}
                                            disabled={!isLoggedIn || loadingReaction === reply.id}
                                            className={`${btnBase} ${btnSm} ${reply.userChoice === "like" ? likeActive : `${reactionIdle(theme)} ${likeHover}`}`}
                                        >
                                            <HiHandThumbUp size={13} />
                                            <span>{loadingReaction === reply.id ? "…" : reply.likesCount ?? 0}</span>
                                        </button>

                                        <button
                                            onClick={() => clickLike(reply, "dislike")}
                                            disabled={!isLoggedIn || loadingReaction === reply.id}
                                            className={`${btnBase} ${btnSm} ${reply.userChoice === "dislike" ? dislikeActive : `${reactionIdle(theme)} ${dislikeHover}`}`}
                                        >
                                            <HiHandThumbDown size={13} />
                                            <span>{loadingReaction === reply.id ? "…" : reply.dislikesCount ?? 0}</span>
                                        </button>

                                        {isLoggedIn && currentUser?.id && !isOwnReply && (
                                            <ReportButton
                                                type="review"
                                                targetId={reply.id}
                                                targetLabel={
                                                    typeof reply.comment === "string" && reply.comment.trim()
                                                        ? `"${reply.comment.slice(0, 60)}..."`
                                                        : t("radio.userReply", "Réponse utilisateur")
                                                }
                                                compact
                                            />
                                        )}

                                        {isOwnReply && editingId !== reply.id && (
                                            <>
                                                <button onClick={() => { setEditText(reply.comment); setEditingId(reply.id); }} className={btnEdit(theme)}>
                                                    <HiPencil size={12} /> {t("common.edit")}
                                                </button>
                                                <button
                                                    onClick={async () => { setLoadingDelete(reply.id); await onDeleteReview(reply.id, comment.id); setLoadingDelete(null); }}
                                                    className={btnDelete(theme)}
                                                >
                                                    {loadingDelete === reply.id ? "…" : <HiTrash size={13} />}
                                                </button>
                                            </>
                                        )}
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
