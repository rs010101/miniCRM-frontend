import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUpload, FaEye } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-gray-600">Manage your order database</p>
              </div>
              <div className="flex items-center gap-4">
                <label 
                  htmlFor="file-upload" 
                  className="btn btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <FaUpload /> Upload CSV
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {fileName && (
                  <span className="text-sm text-gray-600">{fileName}</span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_external_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_identifier}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items_description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.order_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500">No orders found. Upload a CSV file to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
