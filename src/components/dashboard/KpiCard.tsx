import { ArrowDown, ArrowUp } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

const KpiCard = ({ title, value, change, trend }: KpiCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        
        {trend && (
          <div
            className={`flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
              trend === 'up'
                ? 'bg-green-100 text-green-800'
                : trend === 'down'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : trend === 'down' ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            {change}
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: '70%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default KpiCard;