import { useState } from "react";
import { useAppearance } from "../context/AppearanceContext";

const Contact = () => {
    const { theme } = useAppearance();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

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
                                    required
                                    className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
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
                                    required
                                    className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
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
                                required
                                className={`p-4 rounded-xl outline-none transition-all duration-300 border focus:border-primary ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
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
                                required
                                rows={6}
                                className={`p-4 rounded-xl outline-none resize-none transition-all duration-300 border focus:border-primary ${theme === 'dark' ? 'bg-neutral-900/50 border-neutral-800 text-white focus:bg-neutral-900' : 'bg-neutral-50 border-neutral-200 text-black focus:bg-white'}`}
                                placeholder="Votre message..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            Envoyer le message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
