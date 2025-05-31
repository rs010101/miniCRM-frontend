import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUpload, FaEdit, FaTrash } from 'react-icons/fa';

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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <p className="text-gray-600">Manage your customer database</p>
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
            ) : customers.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer, index) => (
                        <tr key={customer._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1 text-blue-600 hover:text-blue-800 relative group"
                                onClick={() => startEdit(customer)}
                              >
                                <FaEdit />
                                <span className="absolute bottom-full mb-1 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none select-none">
                                  Edit
                                </span>
                              </button>
                              <button
                                className="p-1 text-red-600 hover:text-red-800 relative group"
                                onClick={() => deleteCustomer(customer._id)}
                              >
                                <FaTrash />
                                <span className="absolute bottom-full mb-1 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none select-none">
                                  Delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500">No customers found. Upload a CSV file to get started.</p>
              </div>
            )}

            {/* Edit Modal */}
            {editingCustomer && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      submitEdit();
                    }}
                  >
                    <label className="block mb-2">
                      Name
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </label>
                    <label className="block mb-2">
                      Email
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </label>
                    <label className="block mb-2">
                      Phone
                      <input
                        type="text"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </label>
                    <label className="block mb-4">
                      Location
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                      />
                    </label>

                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
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
