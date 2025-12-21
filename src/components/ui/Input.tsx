import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}
export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  return <div className="w-full mb-6">
      <label htmlFor={inputId} className="block text-lg font-bold text-gray-900 mb-2">
        {label}
        {props.required && <span className="text-red-700 ml-1" aria-hidden="true">
            *
          </span>}
      </label>
      <input id={inputId} className={`
          block w-full rounded-lg border-2 px-4 py-3 text-lg text-gray-900 placeholder-gray-500
          focus:border-blue-800 focus:outline-none focus:ring-4 focus:ring-yellow-400
          disabled:bg-gray-100 disabled:text-gray-500
          ${error ? 'border-red-600' : 'border-gray-300'}
          ${className}
        `} aria-invalid={!!error} aria-describedby={error ? errorId : helperText ? helperId : undefined} {...props} />
      {error && <p id={errorId} className="mt-2 text-base font-medium text-red-700 flex items-center">
          <span className="sr-only">Error:</span>
          {error}
        </p>}
      {!error && helperText && <p id={helperId} className="mt-2 text-base text-gray-600">
          {helperText}
        </p>}
    </div>;
}