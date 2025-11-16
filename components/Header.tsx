
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <svg className="h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
             </svg>
            <h1 className="text-2xl font-bold text-brand-dark">
              Clin<span className="text-brand-primary">Rx</span>
            </h1>
          </div>
          <span className="text-sm font-medium text-gray-500">AI Drug Interaction Checker</span>
        </div>
      </div>
    </header>
  );
};
