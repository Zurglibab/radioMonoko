import { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import logo from "../assets/images/icon_large.png";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            await register(email, password);
            navigate("/feed");
        } catch (error) {
            console.error("Registration failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans">
            <div className="mb-10 text-center">
                <Link to="/">
                    <img src={logo} alt="Logo" className="w-48 h-auto mb-4 mx-auto" />
                </Link>
            </div>

            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="bg-neutral-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl"
                >
                    <h1 className="text-3xl text-center font-black text-white uppercase tracking-tighter mb-8">
                        Inscription
                    </h1>

                    <div className="space-y-5">
                        <div className="relative group">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Confirmer le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-10 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-rose-600/20"
                    >
                        Créer mon compte
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="mt-8 flex flex-col gap-4 items-center">
                        <div className="h-px w-full bg-white/5"></div>
                        <p className="text-neutral-500 text-xs">
                            Déjà membre ?{" "}
                            <Link to="/login" className="text-rose-500 font-bold hover:underline transition-all">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </form>

                <p className="mt-12 text-center text-[8px] uppercase tracking-[0.5em] text-neutral-800">
                    © 2026 RadioMonoco - Tous droits réservés
                </p>
            </div>
        </div>
    );
};

export default Register;