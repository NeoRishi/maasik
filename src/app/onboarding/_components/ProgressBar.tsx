'use client';

interface ProgressBarProps {
  percent: number;
  visible?: boolean;
}

export default function ProgressBar({ percent, visible = true }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'rgba(217, 201, 167, 0.5)',
        zIndex: 60,
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, percent))}%`,
          background: '#C84B31',
          transition: 'width 450ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}
