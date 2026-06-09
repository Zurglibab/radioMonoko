import { useAppearance } from "../../context/AppearanceContext.tsx";

export const Loader = () => {
    const { theme } = useAppearance();

    return (
        <div className={`flex-1 flex items-center justify-center p-4 ${theme === 'dark' ? 'text-white' : 'text-neutral-100'}`}>
            <div className="w-6 h-6 border-2 border-current border-t-rose-500 rounded-full animate-spin" />
        </div>
    );
};