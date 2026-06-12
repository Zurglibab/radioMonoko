import { useState } from "react";
import type { ChatInputProps } from "../../interfaces/Props.types.ts";
import { DEFAULT_THEME } from "../../assets/themes/DefaultTheme.ts";
import { useAppearance } from "../../context/AppearanceContext.tsx";
import { useTranslation } from "react-i18next";

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
    const [text, setText] = useState('');
    const { theme } = useAppearance();
    const { t } = useTranslation();

    return (
        <div className={`p-3 border-t flex items-center gap-2 transition-colors
            ${theme === 'dark' ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <input
                className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none transition-all placeholder:text-neutral-500 focus:ring-2 
                focus:ring-rose-500 ${DEFAULT_THEME.borderHover}
                ${theme === 'dark'
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'bg-neutral-100 text-neutral-900 border border-neutral-200'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={disabled ? t("chat.sendingInput") : t("chat.sendPlaceholder")}
                value={text}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && text.trim() && !disabled) {
                        onSend(text);
                        setText('');
                    }
                }}
            />
        </div>
    );
};