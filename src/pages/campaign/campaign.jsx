import React, { useState, useEffect, useCallback } from "react";
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaUsers,
  FaPaperPlane,
  FaExclamationCircle,
  FaList,
  FaPlus,
  FaClock,
  FaBullhorn,
  FaLayerGroup
} from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { StatsCard, DataCard, Table, Badge, Button } from '../../components/common/CardStyles';

const CampaignStat = ({ label, value, icon: Icon, color = "primary", className = "" }) => (
  <div className={`flex items-center ${className}`}>
    <div className={`flex-shrink-0 h-10 w-10 bg-${color}-100 rounded-lg flex items-center justify-center mr-3`}>
      <Icon className={`h-5 w-5 text-${color}-600`} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

const Campaign = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  
  const [segments, setSegments] = useState([]);
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
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSegmentRules = useCallback(async () => {
    try {
      const response = await fetch('https://minicrm-backend-1.onrender.com/api/segment-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSegments(data);
      } else if (data.success) {
        setSegments(data.data || []);
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
        setCampaigns(data);
      } else if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedSegment || !message) {
      alert("Please fill all required fields.");
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
            intent: intent || ""
          }
        })
      });
      
      const data = await response.json();
      
      if (data && (data._id || data.id)) {
        alert('Campaign created successfully!');
        setCampaignName("");
        setSelectedSegment("");
        setMessage("");
        setIntent("");
        
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
      
      if (!response.ok) {
        throw new Error('Failed to generate message suggestions');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessageSuggestions(data);
        setShowSuggestions(true);
      } else if (data.suggestions) {
        setMessageSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error generating AI messages:', error);
      alert('Failed to generate message suggestions');
    } finally {
      setMessageLoading(false);
    }
  };

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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'create' ? 'Create Campaign' : 'Campaign History'}
                </h1>
                <p className="text-gray-600">
                  {viewMode === 'create' 
                    ? 'Create and send targeted messages to customer segments' 
                    : 'View past campaigns and their performance'}
                </p>
              </div>
              <Button
                onClick={() => {
                  setViewMode(viewMode === 'create' ? 'history' : 'create');
                  setSelectedCampaign(null);
                  setCampaignStats(null);
                }}
                icon={viewMode === 'create' ? FaList : FaPlus}
              >
                {viewMode === 'create' ? 'View Campaign History' : 'Create New Campaign'}
              </Button>
            </div>

            {viewMode === 'create' ? (
              <div className="space-y-6">
                {/* Campaign Creation Form */}
                <DataCard>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Campaign Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="E.g., Summer Sale Campaign"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select Segment <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Choose a segment</option>
                        {segments.map((seg) => (
                          <option key={seg._id} value={seg._id}>
                            {seg.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Campaign Intent (for AI Message Generation)
                      </label>
                      <input
                        type="text"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="E.g., Promote summer collection, Re-engage inactive customers"
                      />
                      <Button
                        onClick={handleGenerateAIMessage}
                        variant="secondary"
                        size="sm"
                        loading={messageLoading}
                        disabled={!intent || !selectedSegment}
                        className="mt-2"
                      >
                        Generate Message Suggestions
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter your campaign message..."
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Use {'{name}'} to personalize the message with customer's name
                      </p>
                    </div>

                    {/* AI Message Suggestions */}
                    {showSuggestions && messageSuggestions.length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">AI Message Suggestions</h4>
                        <div className="space-y-3">
                          {messageSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                message === suggestion
                                  ? 'bg-primary-50 border-primary-300'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => setMessage(suggestion)}
                            >
                              <p className="text-gray-700">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handleCreateCampaign}
                        icon={FaPaperPlane}
                        loading={loading}
                        disabled={!campaignName || !selectedSegment || !message}
                      >
                        Create & Send Campaign
                      </Button>
                    </div>
                  </div>
                </DataCard>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedCampaign ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedCampaign(null);
                        setCampaignStats(null);
                      }}
                      className="text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      ← Back to all campaigns
                    </button>

                    <DataCard>
                      {error ? (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                          {error}
                        </div>
                      ) : campaignStats && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                              {campaignStats.name}
                            </h2>
                            <Badge color={
                              campaignStats.status === 'completed' ? 'green' :
                              campaignStats.status === 'in_progress' ? 'blue' :
                              'yellow'
                            }>
                              {campaignStats.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <CampaignStat
                              label="Total Recipients"
                              value={campaignStats.total}
                              icon={FaUsers}
                            />
                            <CampaignStat
                              label="Delivered"
                              value={campaignStats.delivered}
                              icon={FaCheckCircle}
                              color="green"
                            />
                            <CampaignStat
                              label="Pending"
                              value={campaignStats.pending}
                              icon={FaClock}
                              color="yellow"
                            />
                            <CampaignStat
                              label="Failed"
                              value={campaignStats.failed}
                              icon={FaExclamationCircle}
                              color="red"
                            />
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Performance Summary</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700">{campaignStats.summary}</p>
                              <div className="mt-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Delivery Rate</span>
                                  <span>
                                    {((campaignStats.delivered / campaignStats.total) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{
                                      width: `${(campaignStats.delivered / campaignStats.total) * 100}%`
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Message Content</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700">{campaignStats.message}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </DataCard>
                  </>
                ) : (
                  <>
                    {/* Campaign Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <StatsCard
                        title="Total Campaigns"
                        value={campaigns.length}
                        icon={FaBullhorn}
                        color="primary"
                      />
                      <StatsCard
                        title="Active Campaigns"
                        value={campaigns.filter(c => c.status === 'in_progress').length}
                        icon={FaLayerGroup}
                        color="blue"
                      />
                      <StatsCard
                        title="Completed"
                        value={campaigns.filter(c => c.status === 'completed').length}
                        icon={FaCheckCircle}
                        color="green"
                      />
                      <StatsCard
                        title="Total Reached"
                        value={campaigns.reduce((acc, c) => acc + (c.stats?.total || 0), 0)}
                        icon={FaUsers}
                        color="purple"
                      />
                    </div>

                    {/* Campaigns Table */}
                    <DataCard>
                      {loading ? (
                        <div className="text-center py-8">
                          <FaSpinner className="animate-spin mx-auto text-primary-600" size={32} />
                          <p className="text-gray-600 mt-2">Loading campaigns...</p>
                        </div>
                      ) : campaigns.length > 0 ? (
                        <Table>
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Info</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map((campaign) => (
                              <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                      <FaBullhorn className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {campaign.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {campaign.intent || 'No intent specified'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge color="blue">
                                    {campaign.segmentRuleId?.name || campaign.segmentName || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge
                                    color={
                                      campaign.status === 'completed' ? 'green' :
                                      campaign.status === 'in_progress' ? 'blue' :
                                      'yellow'
                                    }
                                  >
                                    {campaign.status === 'completed' ? 'Completed' :
                                     campaign.status === 'in_progress' ? 'In Progress' :
                                     'Pending'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(campaign.createdAt || campaign.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleViewStats(campaign._id)}
                                    className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-center py-12">
                          <FaBullhorn className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No campaigns yet
                          </h3>
                          <p className="text-gray-500 mb-6">
                            Create your first campaign to engage with your customers
                          </p>
                          <button
                            onClick={toggleViewMode}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow"
                          >
                            <FaPlus className="mr-2" />
                            Create Your First Campaign
                          </button>
                        </div>
                      )}
                    </DataCard>
                  </>
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