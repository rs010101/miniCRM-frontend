import { FaUsers, FaShoppingCart, FaChartLine, FaEnvelope } from 'react-icons/fa';

export default function DashboardContent() {
  // Sample data - in a real app, this would come from your API
  const stats = [
    { id: 1, title: 'Total Customers', value: '1,284', icon: FaUsers, color: 'bg-blue-500' },
    { id: 2, title: 'Total Orders', value: '3,567', icon: FaShoppingCart, color: 'bg-green-500' },
    { id: 3, title: 'Revenue', value: '$45,289', icon: FaChartLine, color: 'bg-purple-500' },
    { id: 4, title: 'Campaigns', value: '24', icon: FaEnvelope, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="card border border-gray-100 flex items-center">
              <div className={`${stat.color} p-4 rounded-lg mr-4`}>
                <stat.icon className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chart */}
          <div className="card lg:col-span-2 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="card border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-medium">#{item}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">New customer signed up</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
