import type { ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Passthrough — scroll fly-in was too heavy on CPU/GPU. */
export default function ScrollReveal({
  children,
  className = '',
}: ScrollRevealProps) {
  if (!className) return <>{children}</>;
  return <div className={className}>{children}</div>;
}
