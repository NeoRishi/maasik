'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article';
  id?: string;
};

export function MotionSection({
  delay = 0,
  y = 14,
  className,
  children,
  as = 'div',
  id,
}: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: reduced ? 0 : delay,
      },
    },
  };

  return (
    <MotionTag
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12% 0px' }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}

export function MotionStagger({
  className,
  children,
  delay = 0,
  staggerChildren = 0.08,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  staggerChildren?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : staggerChildren,
            delayChildren: reduced ? 0 : delay,
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({
  className,
  children,
  y = 12,
  as = 'div',
}: {
  className?: string;
  children?: React.ReactNode;
  y?: number;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'span';
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduced ? 0 : 0.6,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={cn(className)}
    >
      {children}
    </MotionTag>
  );
}
