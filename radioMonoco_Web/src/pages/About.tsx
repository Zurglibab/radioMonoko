import { useAppearance } from "../context/AppearanceContext";

const About = () => {
    const { theme } = useAppearance();

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center transition-colors duration-700">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 uppercase tracking-widest text-primary drop-shadow-sm">
                    À propos de nous
                </h1>
                <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-500 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    RadioMonoco est votre nouvelle plateforme dédiée à la découverte et à l'écoute des meilleures stations de radio. Notre objectif est de vous offrir une expérience fluide, intuitive et sans interruption, peu importe où vous êtes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-20">
                <div className={`p-8 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-app-bg/50 border border-neutral-800' : 'bg-white shadow-lg shadow-neutral-200/50'}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Radios Radio France</h3>
                    <p className={`leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Écoutez en direct toutes les stations de Radio France. Une qualité de diffusion exceptionnelle pour ne rien manquer de l'actualité et de la culture.
                    </p>
                </div>

                <div className={`p-8 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-app-bg/50 border border-neutral-800' : 'bg-white shadow-lg shadow-neutral-200/50'}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Émissions Radio France</h3>
                    <p className={`leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Retrouvez vos émissions et podcasts préférés de Radio France en replay. Explorez un catalogue riche et varié à votre rythme.
                    </p>
                </div>

                <div className={`p-8 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-app-bg/50 border border-neutral-800' : 'bg-white shadow-lg shadow-neutral-200/50'}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Vos Collections</h3>
                    <p className={`leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Créez, organisez et gérez vos propres collections de podcasts et d'émissions pour les retrouver facilement en un seul clic.
                    </p>
                </div>

                <div className={`p-8 rounded-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-app-bg/50 border border-neutral-800' : 'bg-white shadow-lg shadow-neutral-200/50'}`}>
                    <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Messagerie entre amis</h3>
                    <p className={`leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Restez connectés avec vos proches grâce à notre système de messagerie intégré. Partagez et discutez de vos émissions favorites directement sur la plateforme.
                    </p>
                </div>
            </div>

            <div className={`w-full p-10 md:p-16 rounded-3xl text-center transition-all duration-500 ${theme === 'dark' ? 'bg-gradient-to-br from-neutral-900 to-black border border-neutral-800' : 'bg-gradient-to-br from-neutral-100 to-white shadow-xl shadow-neutral-200/50'}`}>
                <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Prêt à commencer l'écoute ?</h2>
                <p className={`text-lg mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Rejoignez notre communauté et partager entre amis vos divers émissions.
                </p>
                <a href="/" className="inline-block px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                    Découvrir les radios
                </a>
            </div>
        </div>
    );
};

export default About;
