import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import DashboardCard from '../../components/dashboard/DashboardCard';
import KpiCard from '../../components/dashboard/KpiCard';
import { Plus, ChevronDown, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [recentKpis, setRecentKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's dashboards
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('dashboards')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(6);

        if (dashboardError) throw dashboardError;
        
        // Fetch recent KPIs
        const { data: kpiData, error: kpiError } = await supabase
          .from('kpis')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (kpiError) throw kpiError;

        setDashboards(dashboardData || []);
        setRecentKpis(kpiData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Sample dashboard data for UI demonstration
  const sampleDashboards = [
    { id: 1, title: 'Sales Overview', description: 'Monthly sales metrics and KPIs', last_updated: '2 hours ago' },
    { id: 2, title: 'Marketing Performance', description: 'Campaign effectiveness and ROI', last_updated: '1 day ago' },
    { id: 3, title: 'Customer Insights', description: 'Customer behavior and segmentation', last_updated: '3 days ago' },
    { id: 4, title: 'Product Analytics', description: 'Product usage and performance', last_updated: '1 week ago' }
  ];

  // Sample KPI data for UI demonstration
  const sampleKpis = [
    { id: 1, title: 'Monthly Revenue', value: '$24,500', change: '+12%', trend: 'up' },
    { id: 2, title: 'New Customers', value: '156', change: '+8%', trend: 'up' },
    { id: 3, title: 'Conversion Rate', value: '3.2%', change: '-0.5%', trend: 'down' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {welcomeMessage()}, {user?.name || 'there'}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your dashboards today.
            </p>
          </div>
          <Link
            to="/dashboard-builder"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Link>
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(recentKpis.length > 0 ? recentKpis : sampleKpis).map((kpi) => (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Recent dashboards */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Dashboards</h2>
          <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            View all
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading dashboards...</p>
          </div>
        ) : dashboards.length > 0 || sampleDashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashboards.length > 0 ? dashboards : sampleDashboards).map((dashboard) => (
              <DashboardCard
                key={dashboard.id}
                title={dashboard.title}
                description={dashboard.description}
                lastUpdated={dashboard.last_updated || dashboard.updated_at}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Layers className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No dashboards yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new dashboard.</p>
            <div className="mt-6">
              <Link
                to="/dashboard-builder"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;