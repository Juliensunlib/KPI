import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { ArrowLeft, Save, Eye } from 'lucide-react';

const DashboardBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    title: '',
    description: '',
    layout: 'grid',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!dashboardData.title.trim()) {
      alert('Please enter a dashboard title');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .insert([
          {
            title: dashboardData.title,
            description: dashboardData.description,
            layout: dashboardData.layout,
            is_public: dashboardData.isPublic,
            user_id: user?.id
          }
        ])
        .select();

      if (error) throw error;

      console.log('Dashboard created:', data);
      navigate('/');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      alert('Error creating dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Builder</h1>
              <p className="text-gray-600">Create and customize your dashboard</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Dashboard'}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Dashboard Title
            </label>
            <input
              type="text"
              id="title"
              value={dashboardData.title}
              onChange={(e) => setDashboardData({ ...dashboardData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter dashboard title..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={dashboardData.description}
              onChange={(e) => setDashboardData({ ...dashboardData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your dashboard..."
            />
          </div>

          <div>
            <label htmlFor="layout" className="block text-sm font-medium text-gray-700 mb-1">
              Layout Type
            </label>
            <select
              id="layout"
              value={dashboardData.layout}
              onChange={(e) => setDashboardData({ ...dashboardData, layout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="grid">Grid Layout</option>
              <option value="masonry">Masonry Layout</option>
              <option value="flexible">Flexible Layout</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={dashboardData.isPublic}
              onChange={(e) => setDashboardData({ ...dashboardData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
              Make this dashboard public
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Canvas (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard Canvas</h2>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Dashboard Canvas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop KPI components here to build your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilder;
