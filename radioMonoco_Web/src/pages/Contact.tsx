import { useState } from "react";
import { useAppearance } from "../context/AppearanceContext";
import {useTranslation} from "react-i18next";

const Contact = () => {
    const { theme } = useAppearance();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formspreeEndpoint = "https://formspree.io/f/mrevkywe";
        
        setIsLoading(true);

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message
                })
            });

            if (response.ok) {
                setIsSubmitted(true);
                setTimeout(() => setIsSubmitted(false), 5000);
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                alert("Erreur lors de l'envoi du formulaire. Veuillez vérifier l'ID Formspree.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            alert("Erreur réseau. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center transition-colors duration-700">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-widest text-primary drop-shadow-sm">
                    Contactez-nous
                </h1>
                <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    Une question, une suggestion ou un problème technique ? N'hésitez pas à nous envoyer un message. Notre équipe vous répondra dans les plus brefs délais.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 w-full">
                <div className={`flex-1 p-10 rounded-3xl transition-all duration-500 ${theme === 'dark' ? 'bg-app-bg/50 border border-neutral-800' : 'bg-white shadow-xl shadow-neutral-200/50'}`}>
                    <h2 className={`text-2xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Envoyez-nous un message</h2>

                    {isSubmitted && (
                        <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-medium">
                            Votre message a été envoyé avec succès. Nous vous contacterons bientôt !
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 flex flex-col gap-2">
                                <label htmlFor="name" className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Nom</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary disabled:opacity-50 ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
                                    placeholder="Votre nom complet"
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <label htmlFor="email" className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary disabled:opacity-50 ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
                                    placeholder="votre.email@exemple.com"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="subject" className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Sujet</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                                className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary disabled:opacity-50 ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
                                placeholder="De quoi s'agit-il ?"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="message" className={`text-sm font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                                rows={6}
                                className={`p-4 rounded-xl outline-none resize-none transition-all duration-300 border focus:border-primary disabled:opacity-50 ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
                                placeholder="Votre message..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-4 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Envoyer le message"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
