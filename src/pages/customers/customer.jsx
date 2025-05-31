import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUpload, FaEdit, FaTrash, FaUserFriends, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { StatsCard, DataCard, Table } from '../../components/common/CardStyles';

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // customer object to edit
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", location: "" });
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Load saved data on page load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://minicrm-backend-1.onrender.com/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (Array.isArray(json)) {
          setCustomers(json);
        } else {
          console.error("Unexpected data:", json);
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
          name: entry.Name || entry.name || "",
          email: entry.Email || entry.email || "",
          phone: entry.Phone || entry.phone || "",
          location: entry.Location || entry.location || "",
        }));
        setCustomers(normalizedData);
        saveDataToBackend(normalizedData);
      },
    });
  };

  const saveDataToBackend = async (data) => {
    setLoading(true);
    try {
      // Bulk import endpoint expects an array of customer objects
      const res = await fetch("https://minicrm-backend-1.onrender.com/api/customers/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        console.error(json.message || "Failed to save customers");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Edit handlers
  const startEdit = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      location: customer.location || "",
    });
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitEdit = async () => {
    if (!editingCustomer) return;

    setLoading(true);
    try {
      const res = await fetch(`https://minicrm-backend-1.onrender.com/api/customers/${editingCustomer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const updatedCustomer = await res.json();
      if (res.ok) {
        setCustomers(customers.map(c => (c._id === updatedCustomer._id ? updatedCustomer : c)));
        setEditingCustomer(null);
      } else {
        console.error(updatedCustomer.message || "Failed to update customer");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Delete handlers
  const deleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    setLoading(true);
    try {
      const res = await fetch(`https://minicrm-backend-1.onrender.com/api/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (res.ok) {
        setCustomers(customers.filter(c => c._id !== customerId));
      } else {
        console.error(json.message || "Failed to delete customer");
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600 mt-1">Upload, manage, and analyze your customer database</p>
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

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Customers"
                value={customers.length}
                icon={FaUserFriends}
                color="primary"
              />
              <StatsCard
                title="Active Customers"
                value={customers.filter(c => c.status === 'active').length || 0}
                icon={FaUserFriends}
                color="green"
              />
              <StatsCard
                title="New This Month"
                value={customers.filter(c => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length || 0}
                icon={FaUserFriends}
                color="blue"
                trend={12}
              />
              <StatsCard
                title="Locations"
                value={new Set(customers.map(c => c.location)).size || 0}
                icon={FaMapMarkerAlt}
                color="purple"
              />
            </div>

            {/* Customer Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : customers.length > 0 ? (
              <DataCard>
                <div className="overflow-x-auto">
                  <Table>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer, index) => (
                        <tr key={customer._id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-medium text-lg">
                                  {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">Customer ID: {customer._id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <FaEnvelope className="mr-2 text-gray-400" /> {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <FaPhone className="mr-2 text-gray-400" /> {customer.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaMapMarkerAlt className="mr-2 text-gray-400" />
                              {customer.location || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <button
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded"
                                onClick={() => startEdit(customer)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-100 rounded"
                                onClick={() => deleteCustomer(customer._id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </DataCard>
            ) : (
              <DataCard className="text-center py-12">
                <FaUserFriends className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                <p className="text-gray-500 mb-6">Get started by uploading your customer data</p>
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

            {/* Edit Modal */}
            {editingCustomer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Customer</h2>
                  <form onSubmit={e => { e.preventDefault(); submitEdit(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
