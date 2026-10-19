/* ═══════════════════════════════════════════════════════════════
   Velora — Badge Component
   Reusable badge with multiple variant styles.
   ═══════════════════════════════════════════════════════════════ */

'use client';

type BadgeVariant =
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'rose'
  | 'gold';

interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: BadgeVariant;
  readonly icon?: string;
}

export function Badge({ children, variant = 'accent', icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
