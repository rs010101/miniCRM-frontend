import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUpload, FaEye, FaShoppingCart, FaChartLine, FaUsers } from 'react-icons/fa';
import { StatsCard, DataCard, Table } from '../../components/common/CardStyles';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Load saved orders on page load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://minicrm-backend-1.onrender.com/api/user/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data.orders) {
          setOrders(json.data.orders);
        } else {
          console.error(json.message);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const normalizedData = results.data.map((entry) => ({
          order_external_id: entry.order_external_id || "",
          customer_identifier: entry.customer_identifier || "",
          items_description: entry.items_description || "",
          total_amount: entry.total_amount || "",
          order_date: entry.order_date || "",
        }));
        setOrders(normalizedData);
        saveDataToBackend(normalizedData);
      },
    });
  };

  const saveDataToBackend = async (data) => {
    setLoading(true);
    try {
      const res = await fetch("https://minicrm-backend-1.onrender.com/api/user/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { orders: data } }),
      });
      const json = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const uniqueCustomers = new Set(orders.map(order => order.customer_identifier)).size;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders Overview</h1>
                <p className="text-gray-600 mt-1">Track and manage customer orders</p>
              </div>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <FaUpload className="mr-2" />
                  Upload CSV
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {fileName && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {fileName}
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Orders"
                value={orders.length}
                icon={FaShoppingCart}
                color="primary"
              />
              <StatsCard
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString()}`}
                icon={FaChartLine}
                color="green"
                trend={8.2}
              />
              <StatsCard
                title="Avg. Order Value"
                value={`$${averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                icon={FaShoppingCart}
                color="blue"
              />
              <StatsCard
                title="Unique Customers"
                value={uniqueCustomers}
                icon={FaUsers}
                color="purple"
              />
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : orders.length > 0 ? (
              <DataCard>
                <Table>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <FaShoppingCart className="h-4 w-4 text-primary-600" />
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              {order.order_external_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer_identifier}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {order.items_description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(order.total_amount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(order.order_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-primary-600 hover:text-primary-900 transition-colors p-1 hover:bg-primary-50 rounded"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </DataCard>
            ) : (
              <DataCard className="text-center py-12">
                <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Get started by uploading your orders data</p>
                <label
                  htmlFor="file-upload-empty"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <FaUpload className="mr-2" />
                  Upload CSV
                </label>
                <input
                  id="file-upload-empty"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </DataCard>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order ID</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.order_external_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer ID</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer_identifier}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order Date</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedOrder.order_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="mt-1 text-sm text-gray-900">
                        ${parseFloat(selectedOrder.total_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Items Description</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {selectedOrder.items_description}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
