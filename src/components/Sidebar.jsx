import { FaUser, FaShoppingCart, FaBullhorn, FaSignOutAlt, FaChartLine, FaTachometerAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Mini CRM</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`
            }
          >
            <FaTachometerAlt className="text-lg" /> 
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/customers" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`
            }
          >
            <FaUser className="text-lg" /> 
            <span>Customers</span>
          </NavLink>
          
          <NavLink 
            to="/orders" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`
            }
          >
            <FaShoppingCart className="text-lg" /> 
            <span>Orders</span>
          </NavLink>
          
          <NavLink 
            to="/segment" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`
            }
          >
            <FaBullhorn className="text-lg" /> 
            <span>Segment Rules</span>
          </NavLink>
          
          <NavLink 
            to="/campaign" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}`
            }
          >
            <FaChartLine className="text-lg" /> 
            <span>Campaign</span>
          </NavLink>
          
          {/* Campaign History is now integrated within the Campaign page */}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout} 
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <FaSignOutAlt className="text-lg" /> 
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
