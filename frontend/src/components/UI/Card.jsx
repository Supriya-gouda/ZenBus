import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', hover = false, ...props }) => {
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md border border-gray-100 
        transition-all duration-300 ${hoverClasses} ${padding} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;