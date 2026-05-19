import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function MoonVisual({ className }: Props) {
  return (
    <div
      className={cn(
        'relative aspect-square animate-moon-drift motion-reduce:animate-none',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Warm cream glow */}
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdf8ee" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#f3e9d4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FAF3E7" stopOpacity="0" />
          </radialGradient>

          {/* Crescent shading: terracotta blush on the dark limb */}
          <radialGradient id="moon-body" cx="40%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fdf8ee" />
            <stop offset="60%" stopColor="#f3e9d4" />
            <stop offset="100%" stopColor="#e8dcc1" />
          </radialGradient>

          <radialGradient id="moon-shadow" cx="78%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#7A2818" stopOpacity="0" />
            <stop offset="60%" stopColor="#7A2818" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#7A2818" stopOpacity="0.18" />
          </radialGradient>

          {/* Subtle paper grain via SVG turbulence */}
          <filter id="moon-grain" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="3"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.5
                      0 0 0 0 0.42
                      0 0 0 0 0.32
                      0 0 0 0.12 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Mask carves a slim crescent shape from the disc */}
          <mask id="moon-crescent">
            <rect width="600" height="600" fill="black" />
            <circle cx="300" cy="300" r="220" fill="white" />
            <circle cx="370" cy="285" r="210" fill="black" />
          </mask>
        </defs>

        {/* Outer halo */}
        <circle cx="300" cy="300" r="290" fill="url(#moon-glow)" />

        {/* Full disc, slightly visible behind crescent for depth */}
        <circle cx="300" cy="300" r="220" fill="url(#moon-body)" opacity="0.35" />

        {/* The crescent itself */}
        <g mask="url(#moon-crescent)">
          <circle cx="300" cy="300" r="220" fill="url(#moon-body)" />
          <circle cx="300" cy="300" r="220" fill="url(#moon-shadow)" />
          <circle
            cx="300"
            cy="300"
            r="220"
            fill="#fdf8ee"
            filter="url(#moon-grain)"
            opacity="0.4"
          />
        </g>

        {/* Soft outer ring for definition */}
        <circle
          cx="300"
          cy="300"
          r="220"
          fill="none"
          stroke="#d9c9a7"
          strokeWidth="0.6"
          opacity="0.5"
        />

        {/* A single small star, well off-axis */}
        <circle cx="120" cy="170" r="1.5" fill="#7A2818" opacity="0.4" />
        <circle cx="480" cy="450" r="1.2" fill="#7A2818" opacity="0.3" />
        <circle cx="490" cy="160" r="1.0" fill="#7A2818" opacity="0.25" />
      </svg>
    </div>
  );
}
