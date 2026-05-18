import React, { useState, useRef, useEffect } from "react";
import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineBell,
    HiOutlineColorSwatch,
    HiChevronDown,
    HiOutlineSun,
    HiOutlineMoon,
    HiCheck,
    HiOutlineShieldCheck,
    HiOutlineLockOpen,
    HiOutlineCamera
} from "react-icons/hi";
import { useAppearance } from "../../context/AppearanceContext";
import { useAuth, type User } from "../../context/AuthContext";
import api from "../../services/Api";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

type TabId = 'profile' | 'security' | 'notifs' | 'appearance';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const { theme, setTheme } = useAppearance();
    const { updateUser } = useAuth();

    const [loading, setLoading] = useState(false);

    const [displayName, setDisplayName] = useState(user?.display_name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [website, setWebsite] = useState(user?.website ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [privacy, setPrivacy] = useState(user?.privacy ?? "public");
    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar ?? "");

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);
    const privacyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && user) {
            setDisplayName(user.display_name ?? "");
            setEmail(user.email ?? "");
            setWebsite(user.website ?? "");
            setBio(user.bio ?? "");
            setPrivacy(user.privacy ?? "public");
            setAvatarPreview(user.avatar ?? "");
        }
    }, [isOpen, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const updateData = {
                display_name: displayName,
                email: email,
                website: website,
                bio: bio,
                privacy: privacy
            };
            const response = await api.put<User>("/user/me", updateData);
            updateUser(response.data);
            onClose();
        } catch (error: any) {
            console.error("Erreur :", error.response?.data || error.message);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) setIsSelectOpen(false);
            if (privacyRef.current && !privacyRef.current.contains(event.target as Node)) setIsPrivacyOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-app-bg text-app-text border border-app-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors duration-500">

                <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Paramètres</h2>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">
                            {displayName || email}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-app-text/10 cursor-pointer outline-none active:scale-90">
                        <HiOutlineX className="text-xl" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-[560px]">
                    {/* Suppression du fond bg-app-text/[0.02] pour éviter les traits de démarcation */}
                    <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-app-border p-4 space-y-1">
                        {[
                            { id: 'profile', label: 'Profil', icon: <HiOutlineUser /> },
                            { id: 'security', label: 'Sécurité', icon: <HiOutlineLockClosed /> },
                            { id: 'notifs', label: 'Notifications', icon: <HiOutlineBell /> },
                            { id: 'appearance', label: 'Apparence', icon: <HiOutlineColorSwatch /> },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setActiveTab(s.id as TabId)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer font-medium rounded-xl transition-all duration-200 active:scale-95 ${
                                    activeTab === s.id
                                        ? "bg-app-text/10 shadow-sm text-primary"
                                        : "opacity-50 hover:opacity-100 hover:bg-app-text/5"
                                }`}
                            >
                                <span className="text-lg">{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
                        <div className="flex-1 space-y-8">
                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col items-center justify-center">
                                        <div onClick={() => !loading && fileInputRef.current?.click()} className="relative group cursor-pointer">
                                            {/* Structure simplifiée : une seule bordure, pas de padding parasite */}
                                            <div className="w-28 h-28 rounded-full border-2 border-app-border bg-app-card transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-active:scale-95 overflow-hidden flex items-center justify-center relative">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <HiOutlineUser className="text-4xl opacity-20" />
                                                )}

                                                {/* Overlay caméra intégré */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <HiOutlineCamera className="text-white text-3xl mb-1" />
                                                </div>
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold opacity-50 uppercase ml-1 block">Nom d'affichage</label>
                                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ton pseudo..." className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold opacity-50 uppercase ml-1 block">Site Web</label>
                                            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://ton-site.com" className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 uppercase ml-1 block">Bio</label>
                                        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Raconte-nous quelque chose..." className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none transition-colors" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 uppercase ml-1 block">Visibilité</label>
                                        <div className="relative" ref={privacyRef}>
                                            <button onClick={() => setIsPrivacyOpen(!isPrivacyOpen)} className="w-full flex items-center justify-between bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm cursor-pointer outline-none transition-colors hover:border-primary/30">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary">{privacy === 'private' ? <HiOutlineShieldCheck /> : <HiOutlineLockOpen />}</span>
                                                    <span className="capitalize">{privacy}</span>
                                                </div>
                                                <HiChevronDown className={`transition-transform duration-300 ${isPrivacyOpen ? 'rotate-180 text-primary' : ''}`} />
                                            </button>
                                            {isPrivacyOpen && (
                                                <div className="absolute z-10 mt-2 w-full bg-app-card border border-app-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                    {['public', 'private'].map((p) => (
                                                        <button key={p} onClick={() => { setPrivacy(p as any); setIsPrivacyOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/10 cursor-pointer transition-colors outline-none">
                                                            <span className="capitalize">{p}</span>
                                                            {privacy === p && <HiCheck className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 uppercase ml-1 block">Thème de l'application</label>
                                        <div className="relative" ref={selectRef}>
                                            <button onClick={() => setIsSelectOpen(!isSelectOpen)} className="w-full flex items-center justify-between bg-app-text/5 border border-app-border rounded-xl px-4 py-3 text-sm cursor-pointer outline-none transition-colors hover:border-primary/30">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-primary">{theme === 'dark' ? <HiOutlineMoon /> : <HiOutlineSun />}</span>
                                                    <span>{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</span>
                                                </div>
                                                <HiChevronDown className={`transition-transform duration-300 ${isSelectOpen ? 'rotate-180 text-primary' : ''}`} />
                                            </button>
                                            {isSelectOpen && (
                                                <div className="absolute z-10 mt-2 w-full bg-app-card border border-app-border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                                    {[
                                                        { id: 'dark', label: 'Mode Sombre', icon: <HiOutlineMoon /> },
                                                        { id: 'light', label: 'Mode Clair', icon: <HiOutlineSun /> }
                                                    ].map((t) => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => { setTheme(t.id as any); setIsSelectOpen(false) }}
                                                            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-primary/10 cursor-pointer transition-colors outline-none"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={theme === t.id ? "text-primary" : "opacity-50"}>{t.icon}</span>
                                                                <span className={theme === t.id ? "font-bold" : ""}>{t.label}</span>
                                                            </div>
                                                            {theme === t.id && <HiCheck className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {['security', 'notifs'].includes(activeTab) && (
                                <div className="h-full flex items-center justify-center opacity-40 italic text-sm">
                                    Bientôt disponible...
                                </div>
                            )}
                        </div>

                        {activeTab === 'profile' && (
                            <div className="mt-8 pt-4 border-t border-app-border">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                    className={`w-full font-black py-4 rounded-xl text-xs uppercase tracking-widest cursor-pointer bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 outline-none flex items-center justify-center ${loading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Enregistrer les modifications"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};