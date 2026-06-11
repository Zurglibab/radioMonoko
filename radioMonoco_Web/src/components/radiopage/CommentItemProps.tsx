export const btnBase = "inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100";
export const btnSm   = "h-7 px-3 rounded-lg text-[11px] border";
export const btnMd   = "h-9 px-4 rounded-xl text-xs border";

export const likeActive    = "bg-emerald-500/15 border-emerald-500/60 text-emerald-500 scale-105 ring-2 ring-emerald-500/20";
export const dislikeActive = "bg-amber-500/15  border-amber-500/60  text-amber-500  scale-105 ring-2 ring-amber-500/20";

export const reactionIdle = (theme: string) =>
    theme === "dark"
        ? "bg-white/[0.02] border-white/5 text-neutral-400"
        : "bg-neutral-50 border-neutral-200 text-neutral-500";

export const likeHover    = "hover:text-emerald-400 hover:border-emerald-500/40";
export const dislikeHover = "hover:text-amber-400  hover:border-amber-500/40";

export const btnEdit = (theme: string) =>
    `${btnBase} ${btnSm} ` +
    (theme === "dark"
        ? "bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/60 hover:text-blue-200"
        : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700");

export const btnDelete = (theme: string) =>
    `${btnBase} ${btnSm} ` +
    (theme === "dark"
        ? "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400"
        : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600");

export const btnSave = (loading: boolean) =>
    `${btnBase} ${btnMd} border-transparent ` +
    (loading
        ? "bg-neutral-400 text-white cursor-not-allowed"
        : "bg-emerald-500 text-white hover:brightness-110");

export const btnCancel = (theme: string) =>
    `${btnBase} ${btnMd} ` +
    (theme === "dark"
        ? "border-white/10 text-neutral-300 hover:bg-white/5"
        : "border-neutral-300 text-neutral-600 hover:bg-neutral-100");

export const btnReply = (active: boolean, theme: string) =>
    `${btnBase} ${btnSm} ` +
    (active
        ? "bg-rose-500/10 border-rose-500/40 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/60"
        : theme === "dark"
            ? "bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/5 hover:border-white/10 hover:text-white"
            : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:border-neutral-400 hover:text-neutral-800");