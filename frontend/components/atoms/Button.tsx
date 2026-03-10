import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'link' | 'sm' | 'md' | 'lg';

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

function joinClasses(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) {
  const base =
    'inline-flex select-none items-center justify-center gap-2 font-semibold transition disabled:pointer-events-none disabled:opacity-80';

  const sizeClasses: Record<ButtonSize, string> = {
    link: 'p-0 text-sm',
    sm: 'rounded-xl px-3 py-2 text-sm',
    md: 'rounded-xl px-4 py-2 text-sm',
    lg: 'rounded-xl px-5 py-3 text-sm',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-brand-red text-brand-white hover:bg-[#ad2d2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/30',
    secondary:
      'bg-brand-blue text-white hover:bg-brand-red focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30',
    outline:
      'border border-brand-blue bg-white text-brand-blue hover:border-brand-red hover:text-brand-red focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/25',
    ghost:
      'bg-transparent text-brand-blue hover:text-brand-red focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20',
    danger:
      'bg-transparent text-brand-red hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/20',
  };

  return joinClasses(
    base,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : undefined,
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    children: ReactNode;
  };

export default function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleOptions & {
    children: ReactNode;
  };

export function ButtonAnchor({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </a>
  );
}
