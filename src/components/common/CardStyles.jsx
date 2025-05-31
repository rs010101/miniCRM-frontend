import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend = null }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 animate-fade-in">{value}</h3>
        {trend && (
          <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {trend > 0 ? '↑' : '↓'} 
            <span className="ml-1">{Math.abs(trend)}%</span>
          </p>
        )}
      </div>
      <div className={`bg-${color}-100 p-3 rounded-lg transform transition-transform duration-300 hover:scale-110`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export const DataCard = ({ children, className = '', hover = true }) => (
  <div className={`bg-white rounded-xl shadow-sm ${hover ? 'hover:shadow-md transform hover:-translate-y-1' : ''} transition-all duration-300 p-6 border border-gray-100 ${className}`}>
    {children}
  </div>
);

export const Table = ({ children }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-md">
    <table className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-gray-50">
    <tr>
      {children}
    </tr>
  </thead>
);

export const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

export const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

export const TableRow = ({ children, onClick, className = '' }) => (
  <tr 
    className={`hover:bg-gray-50 transition-colors duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const Badge = ({ children, color = 'primary', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${sizeClasses[size]}
      ${color === 'primary' ? 'bg-primary-100 text-primary-800' :
        color === 'green' ? 'bg-green-100 text-green-800' :
        color === 'red' ? 'bg-red-100 text-red-800' :
        color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        color === 'blue' ? 'bg-blue-100 text-blue-800' :
        color === 'purple' ? 'bg-purple-100 text-purple-800' :
        'bg-gray-100 text-gray-800'}
      transition-all duration-200 hover:bg-opacity-80
    `}>
      {children}
    </span>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon = null,
  loading = false,
  disabled = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className={`${children ? 'mr-2' : ''} -ml-1 h-5 w-5`} />}
          {children}
        </>
      )}
    </button>
  );
};

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => (
  <div className="text-center py-12">
    {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} icon={Icon}>
        {actionLabel}
      </Button>
    )}
  </div>
);
