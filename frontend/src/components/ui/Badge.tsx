import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-slate-100 text-slate-700
    dark:bg-slate-800 dark:text-slate-300
  `,
  primary: `
    bg-blue-100 text-blue-700
    dark:bg-blue-900/50 dark:text-blue-300
  `,
  secondary: `
    bg-purple-100 text-purple-700
    dark:bg-purple-900/50 dark:text-purple-300
  `,
  success: `
    bg-emerald-100 text-emerald-700
    dark:bg-emerald-900/50 dark:text-emerald-300
  `,
  warning: `
    bg-amber-100 text-amber-700
    dark:bg-amber-900/50 dark:text-amber-300
  `,
  danger: `
    bg-red-100 text-red-700
    dark:bg-red-900/50 dark:text-red-300
  `,
  info: `
    bg-cyan-100 text-cyan-700
    dark:bg-cyan-900/50 dark:text-cyan-300
  `,
  outline: `
    bg-transparent border border-slate-300 text-slate-600
    dark:border-slate-600 dark:text-slate-400
  `,
};

const dotColorStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  primary: 'bg-blue-500',
  secondary: 'bg-purple-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
  outline: 'bg-slate-400',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  size = 'md', 
  dot = false,
  className = '', 
  children, 
  ...props 
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorStyles[variant]}`} />
      )}
      {children}
    </span>
  );
};

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'draft' | 'published';
}

const statusVariantMap: Record<string, BadgeVariant> = {
  active: 'success',
  success: 'success',
  published: 'success',
  inactive: 'default',
  draft: 'default',
  pending: 'warning',
  warning: 'warning',
  error: 'danger',
};

const statusLabelMap: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  success: 'Sucesso',
  warning: 'Aviso',
  error: 'Erro',
  draft: 'Rascunho',
  published: 'Publicado',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  return (
    <Badge 
      variant={statusVariantMap[status]} 
      dot 
      {...props}
    >
      {statusLabelMap[status] || status}
    </Badge>
  );
};