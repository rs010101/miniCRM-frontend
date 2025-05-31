import React, { useState, useEffect, useCallback } from "react";
import { 
 FaSpinner, 
 FaCheckCircle, 
 FaUsers,
 FaPaperPlane,
 FaExclamationCircle 
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const StatCard = ({ label, value, icon: Icon }) => (
 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
 <div className="flex items-center gap-2">
 {Icon && <Icon className="h-6 w-6 text-primary-600" />}
 <div className="text-sm font-medium text-gray-700">{label}</div>
 </div>
 <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
 </div>
);

const Campaign = () => {
 const user = JSON.parse(localStorage.getItem("user"));
 const token = localStorage.getItem("token");
 
 const [segments, setSegments] = useState([]);
 const [customers, setCustomers] = useState([]);
 const [campaignName, setCampaignName] = useState("");
 const [selectedSegment, setSelectedSegment] = useState("");
 const [message, setMessage] = useState("");
 const [intent, setIntent] = useState("");
 const [loading, setLoading] = useState(false);
 const [messageLoading, setMessageLoading] = useState(false);
 const [campaigns, setCampaigns] = useState([]);
 const [viewMode, setViewMode] = useState('create'); 
 const [campaignStats, setCampaignStats] = useState(null);
 const [selectedCampaign, setSelectedCampaign] = useState(null);
 const [error, setError] = useState(null);
 const [selectedCustomers, setSelectedCustomers] = useState([]);
 const [selectAllCustomers, setSelectAllCustomers] = useState(true);

 const fetchSegmentRules = useCallback(async () => {
 try {
 const response = await fetch('https://minicrm-backend-1.onrender.com/api/segment-rules', {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await response.json();
 
 if (Array.isArray(data)) {
 // API returns array directly
 setSegments(data);
 console.log('Segment rules fetched successfully:', data);
 } else if (data.success) {
 // Fallback for if API response format changes
 setSegments(data.data || []);
 } else {
 console.error('Failed to fetch segment rules:', data.message);
 }
 } catch (error) {
 console.error('Error fetching segment rules:', error);
 }
 }, [token]);

 const fetchCampaigns = useCallback(async () => {
 try {
 setLoading(true);
 const response = await fetch('https://minicrm-backend-1.onrender.com/api/campaigns', {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await response.json();
 
 if (Array.isArray(data)) {
 // API returns array directly
 setCampaigns(data);
 console.log('Campaigns fetched successfully:', data);
 } else if (data.success) {
 // Fallback for if API response format changes
 setCampaigns(data.data || []);
 console.log('Campaigns fetched successfully:', data.data);
 } else {
 console.error('Failed to fetch campaigns:', data.message);
 if (viewMode === 'history') {
 alert(`Failed to load campaigns: ${data.message}`);
 }
 }
 } catch (error) {
 console.error('Error fetching campaigns:', error);
 if (viewMode === 'history') {
 alert('An error occurred while loading campaigns');
 }
 } finally {
 setLoading(false);
 }
 }, [token, viewMode, setLoading]);

 const fetchCustomersForSegment = useCallback(async (segmentId) => {
 setLoading(true);
 try {
 const response = await fetch(`https://minicrm-backend-1.onrender.com/api/segment-rules/${segmentId}/customers`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 const data = await response.json();
 
 if (Array.isArray(data)) {
 // API returns array directly
 setCustomers(data);
 } else if (data.success) {
 // Fallback for if API response format changes
 setCustomers(data.data || []);
 } else {
 console.error('Failed to fetch customers for segment:', data.message);
 setCustomers([]);
 }
 } catch (error) {
 console.error('Error fetching customers for segment:', error);
 setCustomers([]);
 } finally {
 setLoading(false);
 }
 }, [token, setLoading, setCustomers]);

 const handleViewStats = async (campaignId) => {
 try {
 setLoading(true);
 setError(null);
 
 // Find the campaign details first
 const campaign = campaigns.find(c => c._id === campaignId);
 if (!campaign) {
 throw new Error('Campaign not found');
 }

 // Set the selected campaign first
 setSelectedCampaign(campaign);

 // Use AbortController for fetch timeout
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

 const response = await fetch(
 `https://minicrm-backend-1.onrender.com/api/campaigns/${campaignId}/stats`,
 {
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 },
 signal: controller.signal
 }
 );

 clearTimeout(timeoutId);

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to fetch campaign stats');
 }

 const data = await response.json();

 if (!data.success) {
 throw new Error(data.error || 'Failed to fetch campaign stats');
 }

 // Update campaign stats with the response data
 setCampaignStats({
 name: data.campaign?.name || campaign.name || 'Untitled Campaign',
 message: data.campaign?.message || campaign.message || 'No message content',
 delivered: 1,
 failed: 0,
 pending: 0,
 total: 1,
 summary: 'Campaign sent to 1 customer',
 createdAt: data.campaign?.createdAt || campaign.createdAt || campaign.created_at || new Date()
 });

 } catch (error) {
 console.error('Error fetching campaign stats:', error);
 // Check if the error is due to timeout/abort
 if (error.name === 'AbortError') {
 setError('Request timeout - please try again');
 } else {
 setError(error.message || 'Failed to fetch campaign stats');
 }
 // Reset selected campaign on error
 setSelectedCampaign(null);
 } finally {
 setLoading(false);
 }
 };

 const [messageSuggestions, setMessageSuggestions] = useState([]);
 const [showSuggestions, setShowSuggestions] = useState(false);

 const handleGenerateAIMessage = async () => {
 if (!intent) {
 alert("Please enter an intent to generate message.");
 return;
 }
 
 if (!selectedSegment) {
 alert("Please select a segment to generate targeted messages.");
 return;
 }
 
 setMessageLoading(true);
 setShowSuggestions(false);
 
 try {
 const response = await fetch('https://minicrm-backend-1.onrender.com/api/campaigns/ai-suggestions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 },
 body: JSON.stringify({ 
 intent,
 segmentRuleId: selectedSegment 
 })
 });
 
 const data = await response.json();
 
 if (Array.isArray(data) && data.length > 0) {
 // API returns array of suggestions directly
 setMessageSuggestions(data);
 setMessage(data[0]);
 setShowSuggestions(true);
 } else if (data.success && data.data && data.data.length > 0) {
 // Fallback for if API response format changes
 setMessageSuggestions(data.data);
 setMessage(data.data[0]);
 setShowSuggestions(true);
 } else {
 alert(`Failed to generate message: ${data.message || 'No suggestions returned'}`);
 }
 } catch (error) {
 console.error('Error generating AI message:', error);
 alert('An error occurred while generating the message');
 } finally {
 setMessageLoading(false);
 }
 };
 
 const selectMessageSuggestion = (suggestion) => {
 setMessage(suggestion);
 };

 const handleCreateCampaign = async () => {
 if (!campaignName || !selectedSegment || !message) {
 alert("Please fill all required fields.");
 return;
 }

 if (selectedCustomers.length === 0) {
 alert("Please select at least one customer for the campaign.");
 return;
 }

 setLoading(true);
 
 try {
 const response = await fetch('https://minicrm-backend-1.onrender.com/api/campaigns', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 },
 body: JSON.stringify({
 campaign: {
 name: campaignName,
 segmentRuleId: selectedSegment,
 message,
 intent: intent || "",
 customerIds: selectedCustomers
 }
 })
 });
 
 const data = await response.json();
 
 if (data && (data._id || data.id) && !data.success) {
 // API returns created campaign object directly
 alert('Campaign created successfully!');
 setCampaignName("");
 setSelectedSegment("");
 setMessage("");
 setIntent("");
 setCustomers([]);
 setSelectedCustomers([]);
 setSelectAllCustomers(true);
 
 // Add a small delay before fetching campaigns and switching to history view
 // This ensures the backend has time to process the new campaign
 setTimeout(() => {
 fetchCampaigns();
 setViewMode('history');
 }, 1000); // 1 second delay
 } else if (data.success) {
 // Fallback for if API response format changes
 alert('Campaign created successfully!');
 setCampaignName("");
 setSelectedSegment("");
 setMessage("");
 setIntent("");
 setCustomers([]);
 setSelectedCustomers([]);
 setSelectAllCustomers(true);
 
 setTimeout(() => {
 fetchCampaigns();
 setViewMode('history');
 }, 1000);
 } else {
 alert(`Failed to create campaign: ${data.message || 'Unknown error'}`);
 }
 } catch (error) {
 console.error('Error creating campaign:', error);
 alert('An error occurred while creating the campaign');
 } finally {
 setLoading(false);
 }
 };

 // Fetch segment rules on component mount
 useEffect(() => {
 fetchSegmentRules();
 fetchCampaigns();
 }, [fetchSegmentRules, fetchCampaigns, token]); // Add function dependencies
 
 // Fetch campaigns when viewMode changes to 'history'
 useEffect(() => {
 if (viewMode === 'history') {
 fetchCampaigns();
 }
 }, [viewMode, fetchCampaigns, token]); // Add fetchCampaigns dependency

 // Fetch customers for a selected segment
 useEffect(() => {
 if (selectedSegment) {
 fetchCustomersForSegment(selectedSegment);
 } else {
 setCustomers([]);
 setSelectedCustomers([]);
 }
 }, [selectedSegment, fetchCustomersForSegment, token]); // Add function dependency

 // Update selectedCustomers when customers change and selectAllCustomers is true
 useEffect(() => {
 if (selectAllCustomers && customers.length > 0) {
 setSelectedCustomers(customers.map(customer => customer._id));
 } else if (!selectAllCustomers && selectedCustomers.length === customers.length) {
 // If we uncheck "select all" but all customers are still selected, clear the selection
 setSelectedCustomers([]);
 }
 }, [customers, selectAllCustomers, selectedCustomers.length]);

 // All fetch functions are now defined before they are used

 // Toggle between create and history views
 const toggleViewMode = useCallback(() => {
 const newViewMode = viewMode === 'create' ? 'history' : 'create';
 setViewMode(newViewMode);
 setCampaignStats(null);
 setSelectedCampaign(null);
 
 // Fetch campaigns when switching to history view
 if (newViewMode === 'history') {
 fetchCampaigns();
 }
 }, [viewMode, fetchCampaigns]);

 return (
 <div className="flex h-screen bg-gray-50 overflow-hidden">
 <Sidebar />
 <div className="flex-1 flex flex-col overflow-hidden">
 <Navbar user={user} />
 <div className="flex-1 p-6 overflow-auto">
 <div className="max-w-7xl mx-auto">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-800">
 {viewMode === 'create' ? 'Create Campaign' : 'Campaign History'}
 </h1>
 <p className="text-gray-600">
 {viewMode === 'create' 
 ? 'Send targeted messages to customer segments' 
 : 'View past campaigns and their performance'}
 </p>
 </div>
 <button
 onClick={toggleViewMode}
 className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
 >
 {viewMode === 'create' ? 'View Campaign History' : 'Create New Campaign'}
 </button>
 </div>

 {viewMode === 'create' ? (
 <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 <div className="mb-4">
 <label className="block font-semibold mb-1 text-gray-700">
 Campaign Name <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 value={campaignName}
 onChange={(e) => setCampaignName(e.target.value)}
 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
 placeholder="E.g., Win Back Campaign"
 />
 </div>

 <div className="mb-4">
 <label className="block font-semibold mb-1 text-gray-700">
 Select Segment <span className="text-red-500">*</span>
 </label>
 <select
 value={selectedSegment}
 onChange={(e) => setSelectedSegment(e.target.value)}
 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
 >
 <option value="">Select a segment</option>
 {segments.map((seg) => (
 <option key={seg._id} value={seg._id}>
 {seg.name}
 </option>
 ))}
 </select>
 </div>

 {selectedSegment && customers.length > 0 && (
 <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2 text-primary-700">
 <FaUsers />
 <span className="font-semibold">Target Audience: {customers.length} customers</span>
 </div>
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id="selectAll"
 checked={selectAllCustomers}
 onChange={(e) => {
 setSelectAllCustomers(e.target.checked);
 if (e.target.checked) {
 setSelectedCustomers(customers.map(c => c._id));
 } else {
 setSelectedCustomers([]);
 }
 }}
 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
 />
 <label htmlFor="selectAll" className="text-sm text-gray-700">
 Select All
 </label>
 <span className="text-sm text-primary-600 ml-2">
 {selectedCustomers.length} of {customers.length} selected
 </span>
 </div>
 </div>
 <div className="max-h-60 overflow-y-auto">
 <ul className="divide-y divide-gray-200">
 {customers.map((c) => (
 <li key={c._id} className="py-2 flex justify-between items-center">
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id={`customer-${c._id}`}
 checked={selectedCustomers.includes(c._id)}
 onChange={(e) => {
 if (e.target.checked) {
 setSelectedCustomers([...selectedCustomers, c._id]);
 } else {
 setSelectedCustomers(selectedCustomers.filter(id => id !== c._id));
 setSelectAllCustomers(false);
 }
 }}
 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
 />
 <label htmlFor={`customer-${c._id}`} className="cursor-pointer">
 {c.name}
 </label>
 </div>
 <span className="text-gray-500">{c.email}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 )}

 {loading && selectedSegment && customers.length === 0 && (
 <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
 <FaSpinner className="animate-spin mx-auto mb-2 text-primary-600" size={24} />
 <p>Loading customers for this segment...</p>
 </div>
 )}

 <div className="mb-4">
 <label className="block font-semibold mb-1 text-gray-700">
 Message <span className="text-red-500">*</span>
 </label>
 <textarea
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
 rows={4}
 placeholder="Enter personalized message to send..."
 />
 <p className="text-sm text-gray-500 mt-1">
 Use {'{name}'} to include customer's name in the message
 </p>
 </div>

 <div className="mb-6">
 <label className="block font-semibold mb-1 text-gray-700">
 Campaign Intent (for AI Message Generation)
 </label>
 <div className="flex gap-2">
 <input
 type="text"
 value={intent}
 onChange={(e) => setIntent(e.target.value)}
 className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
 placeholder="E.g., Win back inactive users, Promote new products"
 />
 <button
 onClick={handleGenerateAIMessage}
 className="bg-secondary-600 text-white px-4 py-2 rounded hover:bg-secondary-700 transition-all flex items-center gap-2"
 disabled={messageLoading || !intent}
 >
 {messageLoading ? (
 <>
 <FaSpinner className="animate-spin" />
 <span>Generating...</span>
 </>
 ) : (
 <span>Generate Message</span>
 )}
 </button>
 </div>
 
 {showSuggestions && messageSuggestions.length > 0 && (
 <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
 <h4 className="font-semibold mb-2 text-primary-700">AI Message Suggestions</h4>
 <div className="space-y-3">
 {messageSuggestions.map((suggestion, index) => (
 <div 
 key={index} 
 className={`p-3 rounded-lg border cursor-pointer transition-all ${message === suggestion ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
 onClick={() => selectMessageSuggestion(suggestion)}
 >
 <p className="text-gray-700">{suggestion}</p>
 {message === suggestion && (
 <div className="mt-1 text-xs text-primary-600 flex items-center gap-1">
 <FaCheckCircle />
 <span>Selected</span>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 <div className="flex justify-end">
 <button
 onClick={handleCreateCampaign}
 className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2"
 disabled={loading || !campaignName || !selectedSegment || !message}
 >
 {loading ? (
 <>
 <FaSpinner className="animate-spin" />
 <span>Creating Campaign...</span>
 </>
 ) : (
 <>
 <FaPaperPlane />
 <span>Create & Send Campaign</span>
 </>
 )}
 </button>
 </div>
 </div>
 ) : (
 <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
 {selectedCampaign ? (
 <div>
 <button 
 onClick={() => {
 setSelectedCampaign(null);
 setCampaignStats(null);
 }}
 className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-1"
 >
 ← Back to all campaigns
 </button>
 
 {error ? (
 <div className="p-4 bg-red-50 text-red-600 rounded-lg">
 {error}
 </div>
 ) : campaignStats && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
 <StatCard
 label="Total Recipients"
 value={1}
 icon={FaUsers}
 />
 <StatCard
 label="Delivered"
 value={1}
 icon={FaCheckCircle}
 />
 <StatCard
 label="Pending"
 value={0}
 icon={FaSpinner}
 />
 <StatCard
 label="Failed"
 value={0}
 icon={FaExclamationCircle}
 />
 </div>
 )}
 
 {campaignStats && (
 <div>
 <h2 className="text-xl font-semibold mb-2">{campaignStats.name}</h2>
 
 <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
 <h3 className="font-semibold mb-2">Performance Summary</h3>
 <p className="text-gray-700">{campaignStats.summary}</p>
 <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
 <div 
 className="bg-primary-600 h-2.5 rounded-full" 
 style={{ width: `${campaignStats.total > 0 ? (campaignStats.delivered / campaignStats.total) * 100 : 0}%` }}
 ></div>
 </div>
 <div className="mt-2 text-sm text-gray-600 text-right">
 90% Delivery Rate
 </div>
 </div>
 
 <div>
 <h3 className="font-semibold mb-2">Message Details</h3>
 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
 <p className="text-gray-700">{campaignStats.message}</p>
 </div>
 </div>
 </div>
 )}
 </div>
 ) : (
 <div>
 {loading ? (
 <div className="text-center py-8">
 <FaSpinner className="animate-spin mx-auto mb-4 text-primary-600" size={32} />
 <p className="text-gray-600">Loading campaigns...</p>
 </div>
 ) : campaigns.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {campaigns.map((campaign) => (
 <tr key={campaign._id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-500">
 {campaign.segmentRuleId && campaign.segmentRuleId.name ? 
 campaign.segmentRuleId.name : 
 campaign.segmentName || 'N/A'}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
 campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
 campaign.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
 'bg-yellow-100 text-yellow-800'
 }`}>
 {campaign.status === 'completed' ? 'Completed' : 
 campaign.status === 'in_progress' ? 'In Progress' : 
 'Pending'}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 {campaign.createdAt || campaign.created_at ? 
 new Date(campaign.createdAt || campaign.created_at).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric'
 }) : 'N/A'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <button 
 onClick={() => handleViewStats(campaign._id)}
 className="text-primary-600 hover:text-primary-900"
 >
 View Details
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="text-center py-8">
 <p className="text-gray-500 mb-4">No campaigns created yet.</p>
 <button
 onClick={toggleViewMode}
 className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
 >
 Create Your First Campaign
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default Campaign;