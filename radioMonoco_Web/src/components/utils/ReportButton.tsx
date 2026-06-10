import { useState } from "react";
import { HiOutlineFlag, HiOutlineX } from "react-icons/hi";
import ReportsService, { type ReportType } from "../../services/ReportsService.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import {useTranslation} from "react-i18next";


interface ReportButtonProps {
    type: ReportType;
    targetId: string;
    targetLabel?: string;
    className?: string;
    compact?: boolean;
}

const REVIEW_REASONS_KEYS = [
    "spoiler",
    "insults",
    "spam",
    "inappropriate",
    "other",
];

const USER_REASONS_KEYS = [
    "harassment",
    "suspicious",
    "spam",
    "inappropriate",
    "other",
];

const ReportButton = ({type, targetId, targetLabel, className = "", compact = false,}: ReportButtonProps) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const {t} = useTranslation();

    const reasonsKeys = type === "review" ? REVIEW_REASONS_KEYS : USER_REASONS_KEYS;

    const handleSubmit = async () => {
        try {
            setError("");
            setSuccess("");

            if (!user?.id) {
                setError(t("reports.needLogin"));
                return;
            }

            if (!reason) {
                setError(t("reports.chooseReason"));
                return;
            }

            if (reason === "other" && !customReason.trim()) {
                setError(t("reports.describeProblem"));
                return;
            }

            setLoading(true);

            if (type === "review") {
                await ReportsService.reportReview({
                    reporter_id: user.id,
                    review_id: targetId,
                    report_type: t(`reports.${reason}`),
                    description: reason === "other" ? customReason.trim() : undefined,
                });
            } else {
                await ReportsService.reportUser({
                    reporter_id: user.id,
                    reported_user_id: targetId,
                    report_type: t(`reports.${reason}`),
                    description: reason === "other" ? customReason.trim() : undefined,
                });
            }
            setSuccess(t("reports.sent"));
            setReason("");
            setCustomReason("");

            setTimeout(() => {
                setIsOpen(false);
                setSuccess("");
            }, 2000);
        } catch (err: any) {
            console.error("Erreur signalement :", err);
            setError(err.response?.data?.message || err.response?.data?.error || t("reports.sendError"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        if (!user?.id) {
            alert(t("reports.needLoginContent"));
            return;
        }

        setError("");
        setSuccess("");
        setIsOpen(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className={
                className || `inline-flex items-center gap-2 transition ${
                    compact
                            ? "text-xs text-neutral-500 hover:text-red-400"
                            : "px-4 py-2 rounded-full bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-300 border border-white/5 hover:border-red-500/30"
                    }`
                }
            >
                <HiOutlineFlag />
                {compact ? t("reports.report") : t("reports.report")}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => !loading && setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <button
                            onClick={() => !loading && setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
                        >
                            <HiOutlineX size={22} />
                        </button>

                        <h2 className="text-2xl font-black text-white mb-2">
                            {type === "review" ? t("reports.reportReview") : t("reports.reportUser")}
                        </h2>

                        <p className="text-neutral-500 text-sm mb-6">
                            {targetLabel ? t("reports.aboutToReport", { label: targetLabel }) : t("reports.explain")}
                        </p>

                        <div className="space-y-3">
                            {reasonsKeys.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setReason(item)}
                                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                                        reason === item
                                            ? "border-rose-500 bg-rose-500/10 text-white"
                                            : "border-white/5 bg-neutral-900 text-neutral-400 hover:text-white hover:border-white/10"
                                    }`}
                                >
                                    {t(`reports.${item}`)}
                                </button>
                            ))}
                        </div>

                        {reason === "other" && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder={t("reports.describeProblemPlaceholder")}
                                className="mt-4 w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition resize-none h-28"
                            />
                        )}

                        {error && (
                            <p className="mt-4 text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="mt-4 text-sm text-emerald-400">
                                {success}
                            </p>
                        )}

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => setIsOpen(false)}
                                className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-50"
                            >
                                {t("common.cancel")}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleSubmit}
                                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold transition"
                            >
                                {loading ? t("reports.sending") : t("reports.send")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportButton;