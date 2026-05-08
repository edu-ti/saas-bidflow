import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  default: `
    bg-slate-100 text-slate-900 hover:bg-slate-200 
    dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700
  `,
  primary: `
    bg-blue-600 text-white hover:bg-blue-700 
    dark:bg-blue-600 dark:hover:bg-blue-700
  `,
  secondary: `
    bg-purple-600 text-white hover:bg-purple-700 
    dark:bg-purple-600 dark:hover:bg-purple-700
  `,
  outline: `
    border border-slate-300 bg-transparent text-slate-700 
    hover:bg-slate-100 hover:border-slate-400
    dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-500
  `,
  ghost: `
    bg-transparent text-slate-600 hover:bg-slate-100 
    dark:text-slate-400 dark:hover:bg-slate-800
  `,
  danger: `
    bg-red-600 text-white hover:bg-red-700 
    dark:bg-red-600 dark:hover:bg-red-700
  `,
  success: `
    bg-emerald-600 text-white hover:bg-emerald-700 
    dark:bg-emerald-600 dark:hover:bg-emerald-700
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
  md: 'px-4 py-2 text-sm font-medium gap-2',
  lg: 'px-6 py-3 text-base font-medium gap-2',
  icon: 'p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    loading = false, 
    icon, 
    iconPosition = 'left',
    className = '', 
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-lg
          font-medium transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98]
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon && iconPosition === 'left' ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
        {!loading && icon && iconPosition === 'right' ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';