import React from 'react';
interface SelectOption {
  value: string;
  label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}
export function Select({
  label,
  options,
  error,
  helperText,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;
  return <div className="w-full mb-6">
      <label htmlFor={selectId} className="block text-lg font-bold text-gray-900 mb-2">
        {label}
        {props.required && <span className="text-red-700 ml-1" aria-hidden="true">
            *
          </span>}
      </label>
      <div className="relative">
        <select id={selectId} className={`
            block w-full rounded-lg border-2 px-4 py-3 text-lg text-gray-900 bg-white appearance-none
            focus:border-blue-800 focus:outline-none focus:ring-4 focus:ring-yellow-400
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red-600' : 'border-gray-300'}
            ${className}
          `} aria-invalid={!!error} aria-describedby={error ? errorId : helperText ? helperId : undefined} {...props}>
          <option value="">Select an option</option>
          {options.map(option => <option key={option.value} value={option.value}>
              {option.label}
            </option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p id={errorId} className="mt-2 text-base font-medium text-red-700">
          <span className="sr-only">Error:</span>
          {error}
        </p>}
      {!error && helperText && <p id={helperId} className="mt-2 text-base text-gray-600">
          {helperText}
        </p>}
    </div>;
}