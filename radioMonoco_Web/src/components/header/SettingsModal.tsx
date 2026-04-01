import React from "react";
import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineBell,
    HiOutlineColorSwatch
} from "react-icons/hi";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        email?: string | null;
        [key: string]: any;
    } | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    const sections = [
        { id: 'profile', label: 'Profil', icon: <HiOutlineUser /> },
        { id: 'security', label: 'Sécurité', icon: <HiOutlineLockClosed /> },
        { id: 'notifs', label: 'Notifications', icon: <HiOutlineBell /> },
        { id: 'appearance', label: 'Apparence', icon: <HiOutlineColorSwatch /> },
    ];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Paramètres</h2>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                            {user?.email || "Utilisateur"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white outline-none"
                    >
                        <HiOutlineX className="text-xl" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[500px]">
                    <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/5 p-4 space-y-1 bg-black/20">
                        {sections.map((s) => (
                            <button
                                key={s.id}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95"
                            >
                                <span className="text-lg">{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Informations Publiques</h3>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-neutral-500 uppercase ml-1">Nom d'utilisateur</label>
                                    <input
                                        type="text"
                                        placeholder="Votre pseudo"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-neutral-500 uppercase ml-1">Bio</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Parlez-nous de vous..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="pt-4 border-t border-white/5">
                            <button className="w-full bg-white text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95">
                                Sauvegarder les modifications
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};