import React, { useMemo, useState } from 'react';
import { getItemImageCandidates } from '../utils/assetUrl';

interface ItemSpriteProps {
  id: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
}

export const ItemSprite: React.FC<ItemSpriteProps> = ({
  id,
  name,
  size = 'md',
  className = '',
}) => {
  // Track load failures keyed by item id so that when this component instance is
  // reused with a different `id` (e.g. swapping recipes in the same 3x3 grid
  // slot or output slot), the new sprite retries its textures instead of keeping
  // a stale fallback. Without the id guard, a previously failed sprite would
  // force every subsequent item in that slot into the initials badge.
  const [error, setError] = useState<{ id: string; level: number }>({ id, level: 0 });
  const errorLevel = error.id === id ? error.level : 0;

  const cleanId = id.replace(/^minecraft:/, '').toLowerCase();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    hero: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const urls = useMemo(() => getItemImageCandidates(id), [id]);

  // If all tiers fail, render high-contrast Minecraft block badge with initials
  if (errorLevel >= urls.length) {
    const initials = cleanId
      .split('_')
      .map((w) => w[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');

    return (
      <div
        className={`${sizeClasses[size]} rounded-xs flex items-center justify-center font-pixel text-xs text-[#55ff55] bg-[#1a2218] border border-[#3b4b37] select-none ${className}`}
        title={name || cleanId}
      >
        {initials || 'MC'}
      </div>
    );
  }

  return (
    <img
      src={urls[Math.min(errorLevel, urls.length - 1)]}
      alt={name || cleanId}
      title={name || cleanId}
      loading="lazy"
      decoding="async"
      onError={() =>
        setError((prev) => ({ id, level: (prev.id === id ? prev.level : 0) + 1 }))
      }
      className={`${sizeClasses[size]} object-contain pixelated drop-shadow-md select-none pointer-events-none transition-transform duration-150 ${className}`}
    />
  );
};
