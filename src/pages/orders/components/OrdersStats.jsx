import PropTypes from 'prop-types';
import { FaShoppingCart, FaChartLine, FaUsers, FaCalendarAlt } from 'react-icons/fa';

export default function OrdersStats({ orders = [] }) {
  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      icon: FaShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString()}`,
      icon: FaChartLine,
      color: 'bg-green-500'
    },
    {
      title: 'Unique Customers',
      value: new Set(orders.map(order => order.customer_identifier)).size,
      icon: FaUsers,
      color: 'bg-purple-500'
    },
    {
      title: 'Recent Orders',
      value: orders.filter(order => {
        const orderDate = new Date(order.order_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }).length,
      icon: FaCalendarAlt,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

OrdersStats.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.shape({
    customer_identifier: PropTypes.string.isRequired,
    total_amount: PropTypes.number.isRequired,
    order_date: PropTypes.string.isRequired
  }))
};
