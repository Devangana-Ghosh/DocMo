import React from 'react';
export function SkipLink() {
  return <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-800 focus:text-white focus:font-bold focus:rounded-md focus:shadow-lg focus:ring-4 focus:ring-yellow-400 focus:outline-none transition-none">
      Skip to main content
    </a>;
}