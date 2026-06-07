import type {StarRatingProps} from "../../interfaces/Props.types.ts";
import {HiStar} from "react-icons/hi2";

export const StarRating = ({ rating, hover, onRate, onHover, disabled, theme }: StarRatingProps) => (
    <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                type="button"
                key={star}
                disabled={disabled}
                onMouseEnter={() => !disabled && onHover(star)}
                onMouseLeave={() => !disabled && onHover(0)}
                onClick={() => !disabled && onRate(star)}
                className={`transition-all duration-300 ${disabled ? "opacity-20 cursor-not-allowed" : "hover:scale-125"}`}
            >
                <HiStar
                    className={`text-xl ${
                        star <= (hover || rating)
                            ? "text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                            : theme === "dark" ? "text-white/10" : "text-neutral-200"
                    }`}
                />
            </button>
        ))}
    </div>
);