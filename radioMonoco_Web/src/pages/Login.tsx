import { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import logo from "../assets/images/icon_large.png";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogleToken } = useAuth();
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        scope: "profile email", onSuccess: async (tokenResponse) => {
            try {
                setError("");
                setIsLoading(true);

                if (!tokenResponse.access_token) {
                    setError("Token Google manquant.");
                    setIsLoading(false);
                    return;
                }
                await loginWithGoogleToken(tokenResponse.access_token);
                navigate("/");

            } catch (err: any) {
                console.error("Erreur Google Auth:", err);
                setError(err.response?.data?.error || err.response?.data?.message || "Connexion Google impossible");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setError("La connexion avec Google a échoué.");
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            setIsLoading(true);
            await login(email, password);
            navigate("/");
        } catch (error: any) {
            setError(error.response?.data?.message || "une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans overflow-hidden">

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.15]"
                    style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}>
                </div>

                <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-white/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-white/3 rounded-full blur-[100px]"></div>

                <svg className="absolute inset-0 w-full h-full opacity-[0.03] contrast-150">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-10 text-center">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="w-48 h-auto mb-4 mx-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-neutral-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl"
                    >
                        <h1 className="text-3xl font-black text-center text-white uppercase tracking-tighter mb-8">
                            Connexion
                        </h1>

                        <div className="space-y-6">
                            <div className="relative group">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full bg-neutral-800/30 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all disabled:opacity-50"
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
                                    disabled={isLoading}
                                    className="w-full bg-neutral-800/30 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>

                        {error === "Votre compte a été banni." ? (
                            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 p-5 text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <h3 className="text-red-500 font-black text-xl mb-2 uppercase tracking-wide">Accès Interdit</h3>
                                <p className="text-red-400 text-sm">
                                    Votre compte a été suspendu par un administrateur en raison du non-respect de nos règles de communauté.
                                </p>
                            </div>
                        ) : error ? (
                            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                                <p className="text-red-400 text-sm">
                                    {error}
                                </p>
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-10 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-rose-600/20 cursor-pointer"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Se connecter
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-3 my-6">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-neutral-600 text-xs uppercase tracking-widest">
                                ou
                            </span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsLoading(true);
                                googleLogin();
                            }}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-400 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                        >
                            <span className="text-lg">G</span>
                            Continuer avec Google
                        </button>

                        <div className="mt-8 flex flex-col gap-4 items-center">
                            <div className="h-px w-full bg-white/5"></div>
                            <p className="text-neutral-500 text-xs">
                                Pas encore de compte ?{" "}
                                <Link to="/register" className="text-rose-500 font-bold hover:underline">
                                    S'inscrire
                                </Link>
                            </p>
                        </div>
                    </form>

                    <p className="mt-12 text-center text-[8px] uppercase tracking-[0.5em] text-neutral-800">
                        © 2026 RadioMonoco - Tous droits réservés
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;