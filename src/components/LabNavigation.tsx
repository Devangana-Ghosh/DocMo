import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Microscope, LogOut } from 'lucide-react';
export function LabNavigation() {
  const location = useLocation();
  const navLinks = [{
    name: 'Dashboard',
    href: '/lab/dashboard'
  }, {
    name: 'Upload Report',
    href: '/lab/upload'
  }, {
    name: 'Report History',
    href: '/lab/reports'
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className="border-b-2 border-purple-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Microscope className="h-8 w-8 text-purple-800" />
            <Link to="/lab/dashboard" className="text-2xl font-bold text-purple-900 hover:underline focus:outline-none focus:ring-4 focus:ring-purple-500 rounded-lg px-2 py-1" aria-label="Laboratory Portal Home">
              DoctMo <span className="text-purple-700 font-medium">Lab</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2" aria-label="Laboratory Navigation">
            {navLinks.map(link => <Link key={link.name} to={link.href} className={`
                  text-lg font-medium rounded-lg px-4 py-2 transition-colors duration-200
                  focus:outline-none focus:ring-4 focus:ring-purple-500
                  ${isActive(link.href) ? 'bg-purple-100 text-purple-900 font-bold border-2 border-purple-200' : 'text-gray-700 hover:text-purple-800 hover:bg-purple-50 border-2 border-transparent'}
                `} aria-current={isActive(link.href) ? 'page' : undefined}>
                {link.name}
              </Link>)}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-900">Central Lab</p>
              <p className="text-xs text-gray-500">Technician</p>
            </div>
            <button type="button" className="flex items-center gap-2 text-purple-800 hover:bg-purple-50 px-3 py-2 rounded-lg font-bold border-2 border-transparent hover:border-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-500" aria-label="Log out">
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>;
}