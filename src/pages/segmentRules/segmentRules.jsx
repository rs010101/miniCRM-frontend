import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaTrash, FaList, FaFilter, FaLayerGroup, FaCheck } from 'react-icons/fa';
import { StatsCard, DataCard, Table } from '../../components/common/CardStyles';

const SegmentRules = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [ruleName, setRuleName] = useState('');
  const [logicType, setLogicType] = useState('');
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedRules, setSavedRules] = useState([]);
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'list'

  // Condition types available for selection
  const conditionTypes = [
    { id: 'spend', label: 'Total Spend', type: 'number', operators: ['>', '<', '>=', '<=', '='] },
    { id: 'visits', label: 'Number of Visits', type: 'number', operators: ['>', '<', '>=', '<=', '='] },
    { id: 'inactive', label: 'Inactive for Days', type: 'number', operators: ['>', '<', '>=', '<=', '='] },
    { id: 'location', label: 'Location', type: 'text', operators: ['=', '!=', 'contains'] },
    { id: 'orders', label: 'Number of Orders', type: 'number', operators: ['>', '<', '>=', '<=', '='] },
  ];

  const addCondition = () => {
    setConditions([...conditions, { 
      id: Date.now(), 
      field: '',
      operator: '',
      value: '',
    }]);
  };

  const handleConditionChange = (id, field, value) => {
    setConditions(
      conditions.map(cond =>
        cond.id === id ? { ...cond, [field]: value } : cond
      )
    );
  };

  const removeCondition = (id) => {
    setConditions(conditions.filter(cond => cond.id !== id));
  };
  

  // Memoize fetchSegmentRules to prevent infinite loop
  const fetchSegmentRules = useCallback(async () => {
    try {
      const response = await fetch('https://minicrm-backend-1.onrender.com/api/segment-rules', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (response.ok) {
        setSavedRules(data || []);
      } else {
        console.error('Failed to fetch segment rules:', data.message);
      }
    } catch (error) {
      console.error('Error fetching segment rules:', error);
    }
  }, [token]);
  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this segment rule?')) {
      return;
    }

    setLoading(true);
    try {      const response = await fetch(`https://minicrm-backend-1.onrender.com/api/segment-rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete segment rule');
      }

      const data = await response.json();      if (data.success) {
        // Only update the local state, no need to refetch
        setSavedRules(prev => prev.filter(rule => rule._id !== ruleId));
      } else {
        throw new Error(data.message || 'Failed to delete segment rule');
      }
    } catch (error) {
      console.error('Error deleting segment rule:', error);
      alert(error.message || 'An error occurred while deleting the segment rule');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved segment rules on component mount
  useEffect(() => {
    fetchSegmentRules();
  }, [fetchSegmentRules]);

  const handleSubmit = async () => {
    if (!ruleName) {
      alert('Please enter a rule name');
      return;
    }
    
    if (!logicType) {
      alert('Please select a logic type');
      return;
    }
    
    if (conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }
    
    // Validate all conditions have complete data
    const isValid = conditions.every(cond => 
      cond.field && cond.operator && cond.value
    );
    
    if (!isValid) {
      alert('Please complete all condition fields');
      return;
    }
    
    setLoading(true);
    
    // Prepare rule data
    const ruleData = {
      name: ruleName,
      logicType,
      rules: conditions.map(({ id, ...rest }) => rest) // Remove the temporary id and map conditions to rules
    };
    
    try {
      const response = await fetch('https://minicrm-backend-1.onrender.com/api/segment-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(ruleData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Reset form
        setRuleName('');
        setLogicType('');
        setConditions([]);
        
        // Refresh the list of saved rules
        fetchSegmentRules();
        
        // Switch to list view
        setViewMode('list');
      } else {
        alert(`Failed to save segment rule: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving segment rule:', error);
      alert('An error occurred while saving the segment rule');
    } finally {
      setLoading(false);
    }
  };

  const getOperatorsForField = (fieldId) => {
    const conditionType = conditionTypes.find(type => type.id === fieldId);
    return conditionType ? conditionType.operators : [];
  };

  // Toggle between create and list views
  const toggleViewMode = () => {
    setViewMode(viewMode === 'create' ? 'list' : 'create');
  };

  // Reset form and switch to create mode
  const handleCreateNew = () => {
    setRuleName('');
    setLogicType('');
    setConditions([]);
    setViewMode('create');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Context Switching */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'create' ? 'Create Segment Rule' : 'Segment Rules'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {viewMode === 'create'
                    ? 'Define targeting criteria for your customer segments'
                    : 'Manage and analyze your customer segments'}
                </p>
              </div>
              <button
                onClick={toggleViewMode}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow"
              >
                {viewMode === 'create' ? (
                  <>
                    <FaList className="mr-2" />
                    View Saved Rules
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" />
                    Create New Rule
                  </>
                )}
              </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Segments"
                value={savedRules.length}
                icon={FaLayerGroup}
                color="primary"
              />
              <StatsCard
                title="Active Segments"
                value={savedRules.filter(rule => rule.status === 'active').length || savedRules.length}
                icon={FaCheck}
                color="green"
              />
              <StatsCard
                title="Total Rules"
                value={savedRules.reduce((acc, rule) => acc + (rule.rules?.length || 0), 0)}
                icon={FaFilter}
                color="blue"
              />
            </div>

            {viewMode === 'create' ? (
              <DataCard>
                <div className="space-y-6">
                  {/* Rule Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segment Name
                    </label>
                    <input
                      type="text"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="E.g., High-Value Customers"
                    />
                  </div>

                  {/* Logic Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logic Type
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="AND"
                          checked={logicType === 'AND'}
                          onChange={(e) => setLogicType(e.target.value)}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">Match All Conditions (AND)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="OR"
                          checked={logicType === 'OR'}
                          onChange={(e) => setLogicType(e.target.value)}
                          className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-gray-700">Match Any Condition (OR)</span>
                      </label>
                    </div>
                  </div>

                  {/* Conditions Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Conditions
                      </label>
                      <button
                        onClick={addCondition}
                        className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded hover:bg-primary-100 transition-colors"
                      >
                        <FaPlus className="mr-1" size={12} />
                        Add Condition
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {conditions.map((condition, index) => (
                        <div key={condition.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                          <div className="flex-1">
                            <select
                              value={condition.field}
                              onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                              <option value="">Select Field</option>
                              {conditionTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex-1">
                            <select
                              value={condition.operator}
                              onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                              <option value="">Select Operator</option>
                              {getOperatorsForField(condition.field).map(op => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              placeholder="Enter value"
                            />
                          </div>
                          
                          <button
                            onClick={() => removeCondition(condition.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Save Segment Rule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </DataCard>
            ) : (
              <DataCard>
                {savedRules.length > 0 ? (
                  <Table>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logic Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {savedRules.map((rule) => (
                        <tr key={rule._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <FaLayerGroup className="h-4 w-4 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rule.logicType === 'AND' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {rule.logicType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 space-y-1">
                              {rule.rules && rule.rules.map((cond, idx) => (
                                <div key={idx} className="flex items-center">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  {conditionTypes.find(type => type.id === cond.field)?.label || cond.field} {cond.operator} {cond.value}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(rule.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDelete(rule._id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <FaLayerGroup className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No segment rules yet</h3>
                    <p className="text-gray-500 mb-6">Create your first segment rule to start targeting specific customer groups</p>
                    <button
                      onClick={handleCreateNew}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow"
                    >
                      <FaPlus className="mr-2" />
                      Create Your First Rule
                    </button>
                  </div>
                )}
              </DataCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentRules;
