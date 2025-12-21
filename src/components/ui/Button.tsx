import React from 'react';
import { Loader2 } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'lg' | 'sm';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100';
  const variants = {
    primary: 'bg-blue-800 text-white hover:bg-blue-900 shadow-lg border-2 border-transparent',
    secondary: 'bg-white text-blue-900 border-2 border-blue-800 hover:bg-blue-50',
    outline: 'bg-transparent text-blue-900 border-2 border-blue-800 hover:bg-blue-50',
    ghost: 'bg-transparent text-blue-900 hover:bg-blue-50 hover:underline'
  };
  const sizes = {
    default: 'px-6 py-3 text-lg min-h-[48px]',
    lg: 'px-8 py-4 text-xl min-h-[56px]',
    sm: 'px-4 py-2 text-base min-h-[44px]'
  };
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>;
}