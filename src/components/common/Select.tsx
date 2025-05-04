import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm text-gray-300 dark:text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      className={`bg-gray-600 dark:bg-gray-50 text-white dark:text-gray-900 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export default Select;