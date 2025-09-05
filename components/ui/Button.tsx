import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'green';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, isLoading = false, className = '', ...props }) => {
  const baseClasses = 'font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-md';

  const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
  }

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-sm',
    secondary: 'bg-slate-200 hover:bg-slate-300 focus:ring-slate-400 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 focus:ring-blue-500 text-slate-600 border border-slate-300',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-sm',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
