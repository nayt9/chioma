'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    readonly?: boolean;
    onChange?: (value: number) => void;
    size?: number;
}

export function StarRating({ value, readonly = false, onChange, size = 20 }: StarRatingProps) {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    const handleClick = (rating: number) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    className={`p-1 rounded-full transition-colors ${star <= value
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-300 hover:text-amber-400'
                        } ${readonly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
                    disabled={readonly}
                    aria-label={`Star rating ${star}`}
                >
                    <Star size={size} />
                </button>
            ))}
            {!readonly && (
                <span className="text-xs text-neutral-500 ml-2">{value}/5</span>
            )}
        </div>
    );
}
