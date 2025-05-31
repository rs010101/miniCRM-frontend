import { FaBell, FaCog, FaSearch } from 'react-icons/fa';

export default function Navbar({ user }) {
  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search bar */}
      <div className="relative max-w-md w-full hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder="Search..."
        />
      </div>
      
      {/* Right side elements */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all">
          <FaBell className="text-lg" />
        </button>
        <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all">
          <FaCog className="text-lg" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">Welcome!</p>
            <p className="text-xs text-gray-500">{user?.name || 'User'}</p>
          </div>
          <img
            src={user?.picture || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-100"
          />
        </div>
      </div>
    </div>
  );
}
