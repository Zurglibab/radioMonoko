import React, { useState, useRef, useEffect } from "react";
import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineBell,
    HiOutlineColorSwatch,
    HiChevronDown,
    HiOutlineSun,
    HiOutlineMoon,
    HiCheck,
    HiOutlineShieldCheck,
    HiOutlineLockOpen,
    HiOutlineCamera,
    HiOutlineMail,
    HiOutlineDeviceMobile,
    HiOutlineKey,
    HiOutlineVolumeUp
} from "react-icons/hi";
import { useAppearance } from "../../context/AppearanceContext";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "../../services/UsersService";
import type {SettingsModalProps} from "../../interfaces/Props.types";
import UsersService from "../../services/UsersService.ts";


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
            let finalAvatarUrl = user?.avatar;
            if (avatarPreview !== user?.avatar) {
                const uploadedUrl = await uploadAvatar(avatarPreview);
                console.log(uploadedUrl);
                if (uploadedUrl) {
                    finalAvatarUrl = uploadedUrl.avatar;
                } else {
                    throw new Error("Échec de l'upload de l'avatar");
                }
            }

            const updateData = {
                display_name: displayName,
                email: email,
                website: website,
                bio: bio,
                privacy: privacy,
                avatar: finalAvatarUrl
            };
            const response = await UsersService.updateMe(updateData);
            console.log(response);
            updateUser(response);
            onClose();
        } catch (error: any) {
            console.error("Erreur de mise à jour :", error);
            alert("Erreur lors de la mise à jour du profil.");
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
        <div className="fixed inset-0 z-150 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-app-bg text-app-text border border-app-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transition-colors">

                <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
                    <h2 className="text-xl font-black tracking-tighter">Paramètres</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-app-text/10 cursor-pointer outline-none active:scale-90">
                        <HiOutlineX className="text-xl" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-140">
                    <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-app-border p-4 space-y-1">
                        {[
                            { id: 'profile', label: 'Profil', icon: <HiOutlineUser /> },
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
                        <div className="flex-1">

                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col items-center justify-center">
                                        <div onClick={() => !loading && fileInputRef.current?.click()} className="relative group cursor-pointer">
                                            <div className="w-28 h-28 rounded-full border-2 border-app-border bg-app-card transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 group-active:scale-95 overflow-hidden flex items-center justify-center relative">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <HiOutlineUser className="text-4xl opacity-20" />
                                                )}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <HiOutlineCamera className="text-white text-3xl mb-1" />
                                                </div>
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold opacity-50 ml-1 block">Nom d'affichage</label>
                                            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ton pseudo..." className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-bold opacity-50 ml-1 block">Site Web</label>
                                            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 ml-1 block">Bio</label>
                                        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Raconte-nous quelque chose..." className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none transition-colors" />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 ml-1 block">Visibilité</label>
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

                            {activeTab === 'security' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 pb-2 border-b border-app-border">
                                            <HiOutlineKey className="text-xl text-primary" />
                                            <h3 className="font-bold text-sm">Changer le mot de passe</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold opacity-50 ml-1 block">Mot de passe actuel</label>
                                                <input type="password" placeholder="••••••••" className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold opacity-50 ml-1 block">Nouveau</label>
                                                    <input type="password" placeholder="••••••••" className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-bold opacity-50 ml-1 block">Confirmation</label>
                                                    <input type="password" placeholder="••••••••" className="w-full bg-app-text/5 border border-app-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
                                                </div>
                                            </div>
                                            <button className="text-[11px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer">
                                                Mettre à jour le mot de passe
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-app-border">
                                            <HiOutlineShieldCheck className="text-xl text-primary" />
                                            <h3 className="font-bold text-sm">Sécurité avancée</h3>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-app-text/5 rounded-2xl border border-app-border">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold">Double Authentification (2FA)</p>
                                                <p className="text-[11px] opacity-50">Sécurise ton compte avec un code mobile.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-app-text/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifs' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b border-app-border">
                                            <HiOutlineVolumeUp className="text-xl text-primary" />
                                            <h3 className="font-bold text-sm">Alertes d'activité</h3>
                                        </div>
                                        {[
                                            { id: 'n1', label: 'Nouveaux abonnés', desc: 'Quand quelqu\'un vous suit', icon: <HiOutlineUser /> },
                                            { id: 'n2', label: 'Messages directs', desc: 'Notifications de chat privé', icon: <HiOutlineMail /> },
                                            { id: 'n3', label: 'Connexions', desc: 'Alertes de sécurité par email', icon: <HiOutlineDeviceMobile /> },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-app-text/5 flex items-center justify-center text-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{item.label}</p>
                                                        <p className="text-[11px] opacity-50">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-10 h-5 bg-app-text/10 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold opacity-50 ml-1 block">Thème de l'application</label>
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
                        </div>

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
                    </div>
                </div>
            </div>
        </div>
    );
};