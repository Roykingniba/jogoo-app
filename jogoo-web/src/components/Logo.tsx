// JOGOO logo with its real proportions. Always use this (never a bare <img>)
// so the logo can't be stretched by flex/grid layouts.
import type { CSSProperties } from 'react';
import { asset } from './ui';

const files = {
  full: { src: 'images/jogoo_logo.png', w: 338, h: 160, alt: 'JOGOO Agriculture' },
  white: { src: 'images/jogoo_logo_white.png', w: 338, h: 160, alt: 'JOGOO Agriculture' },
  mark: { src: 'images/jogoo_mark.png', w: 141, h: 160, alt: 'JOGOO' },
} as const;

export function Logo({
  variant = 'full', height, className, style, decorative = false,
}: { variant?: keyof typeof files; height: number; className?: string; style?: CSSProperties; decorative?: boolean }) {
  const f = files[variant];
  const width = Math.round((height * f.w) / f.h);
  return (
    <img
      className={className}
      src={asset(f.src)}
      alt={decorative ? '' : f.alt}
      width={width}
      height={height}
      decoding="async"
      style={{ width, height, maxWidth: 'none', flex: 'none', alignSelf: 'flex-start', objectFit: 'contain', ...style }}
    />
  );
}
