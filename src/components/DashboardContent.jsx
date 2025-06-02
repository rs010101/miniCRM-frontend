import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FaUsers, FaShoppingCart, FaChartLine, FaEnvelope } from 'react-icons/fa';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardContent() {
  // Sample data for the charts
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Campaign Performance',
        data: [65, 59, 80, 81, 56, 95],
        fill: false,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Customer Growth',
        data: [45, 55, 65, 75, 85, 95],
        fill: false,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const customerSegmentData = {
    labels: ['Active', 'VIP', 'New', 'At Risk'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(244, 63, 94, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const stats = [
    {
      title: 'Total Customers',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: FaUsers,
      color: 'bg-indigo-500',
    },
    {
      title: 'Total Orders',
      value: '4,325',
      change: '+23.1%',
      trend: 'up',
      icon: FaShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Revenue',
      value: '$67,290',
      change: '+18.2%',
      trend: 'up',
      icon: FaChartLine,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Campaigns',
      value: '18',
      change: '-2.3%',
      trend: 'down',
      icon: FaEnvelope,
      color: 'bg-purple-500',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Summer Sale Campaign',
      description: 'Campaign launched successfully',
      time: '2 hours ago',
      icon: FaEnvelope,
      iconBg: 'bg-indigo-500',
    },
    {
      id: 2,
      title: 'New Customer Segment',
      description: 'VIP customers segment created',
      time: '4 hours ago',
      icon: FaUsers,
      iconBg: 'bg-green-500',
    },
    {
      id: 3,
      title: 'Campaign Performance',
      description: 'Spring Collection exceeded targets',
      time: '6 hours ago',
      icon: FaChartLine,
      iconBg: 'bg-blue-500',
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600">Here's your business overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} 
                 className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Performance Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
            <div className="h-80">
              <Line
                data={performanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Customer Segments Doughnut */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Segments</h2>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={customerSegmentData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  cutout: '70%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className={`relative ${activity.iconBg} p-2 rounded-lg`}>
                        <activity.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="mt-0.5 text-sm text-gray-500">{activity.description}</p>
                          <p className="mt-2 text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
