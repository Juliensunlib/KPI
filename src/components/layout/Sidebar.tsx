import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PieChart,
  BarChart3,
  Settings,
  Database,
  X,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole: string;
}

const Sidebar = ({ isOpen, setIsOpen, userRole }: SidebarProps) => {
  const location = useLocation();
  const [dashboardSubmenuOpen, setDashboardSubmenuOpen] = useState(false);
  
  useEffect(() => {
    // Close sidebar on mobile when route changes
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const isAdmin = userRole === 'admin';

  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/',
      allowed: true,
    },
    {
      name: 'KPI Builder',
      icon: <PieChart size={20} />,
      path: '/kpi-builder',
      allowed: true,
    },
    {
      name: 'Dashboard Builder',
      icon: <BarChart3 size={20} />,
      path: '/dashboard-builder',
      allowed: true,
    },
    {
      name: 'Users',
      icon: <Users size={20} />,
      path: '/users',
      allowed: isAdmin,
    },
    {
      name: 'Airtable Settings',
      icon: <Database size={20} />,
      path: '/airtable-settings',
      allowed: isAdmin,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">AirtableKPI</span>
            </Link>
            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map(
              (item) =>
                item.allowed && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )
            )}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {userRole === 'admin' ? 'A' : 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userRole === 'admin' ? 'Admin' : 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {userRole === 'admin' ? 'Full access' : 'Limited access'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;