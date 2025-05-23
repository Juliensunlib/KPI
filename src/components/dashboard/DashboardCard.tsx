import { Clock, Edit, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  lastUpdated: string;
}

const DashboardCard = ({ title, description, lastUpdated }: DashboardCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Format the lastUpdated string for display
  const formatLastUpdated = (date: string) => {
    if (!date) return 'Never';
    
    // Check if it's already a relative string
    if (typeof date === 'string' && !date.includes('-') && !date.includes(':')) {
      return date;
    }

    try {
      const updatedDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffTime / (1000 * 60));
          return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return updatedDate.toLocaleDateString();
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <div className="relative">
            <button
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <Link
                  to={`/dashboard/${title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-gray-500 text-xs">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Updated {formatLastUpdated(lastUpdated)}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 rounded-b-lg">
        <Link
          to={`/dashboard/${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
};

export default DashboardCard;