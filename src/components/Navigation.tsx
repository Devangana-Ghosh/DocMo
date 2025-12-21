import { Link, useLocation } from 'react-router-dom';
export function Navigation() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' }
  ];
  
  const isActive = (path: string) => location.pathname === path;
  return (
    <header className="bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="flex items-center text-2xl font-bold text-gray-900 hover:underline focus:outline-none focus:ring-4 focus:ring-blue-500 rounded-lg px-2 py-1" 
              aria-label="DocMo Home"
            >
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 21H5V3H14V9H19Z"/>
                </svg>
              </div>
              docmo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8" aria-label="Main Navigation">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className={`
                    text-lg font-medium transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1
                    ${isActive(link.href) 
                      ? 'text-blue-600 font-bold' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `} 
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
              >
                Help
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}