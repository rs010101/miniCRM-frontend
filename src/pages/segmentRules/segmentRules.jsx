import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaTrash, FaList } from 'react-icons/fa';

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
      const response = await fetch('https://minicrm-backend-av3l.onrender.com/api/segment-rules', {
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
      const response = await fetch('https://minicrm-backend-av3l.onrender.com/api/segment-rules', {
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
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {viewMode === 'create' ? 'Create Segment Rule' : 'Saved Segment Rules'}
                </h1>
                <p className="text-gray-600">Define audience segments using flexible rule logic</p>
              </div>
              <button
                onClick={toggleViewMode}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
              >
                {viewMode === 'create' ? (
                  <>
                    <FaList />
                    <span>View Saved Rules</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>Create New Rule</span>
                  </>
                )}
              </button>
            </div>

            {viewMode === 'create' ? (
              <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                  <label className="block font-semibold mb-1 text-gray-700">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="Enter a name for this segment rule"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block font-semibold mb-1 text-gray-700">
                    Logic Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={logicType}
                    onChange={(e) => setLogicType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select logic type</option>
                    <option value="AND">AND (All conditions must match)</option>
                    <option value="OR">OR (Any condition can match)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold mb-1 text-gray-700">
                    Conditions <span className="text-red-500">*</span>
                  </label>
                  {conditions.map((condition) => (
                    <div key={condition.id} className="flex flex-wrap items-center gap-2 mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                      <select
                        value={condition.field}
                        onChange={(e) => handleConditionChange(condition.id, 'field', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select field</option>
                        {conditionTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={condition.operator}
                        onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!condition.field}
                      >
                        <option value="">Select operator</option>
                        {condition.field && getOperatorsForField(condition.field).map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>

                      <input
                        type={conditionTypes.find(type => type.id === condition.field)?.type || 'text'}
                        value={condition.value}
                        onChange={(e) => handleConditionChange(condition.id, 'value', e.target.value)}
                        placeholder="Enter value"
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!condition.operator}
                      />

                      <button
                        type="button"
                        onClick={() => removeCondition(condition.id)}
                        className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCondition}
                    className="mt-2 flex items-center gap-1 text-primary-600 hover:text-primary-800 focus:outline-none"
                  >
                    <FaPlus size={14} />
                    <span>Add Condition</span>
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !ruleName || !logicType || conditions.length === 0 || conditions.some(c => !c.field || !c.operator || !c.value)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Segment Rule'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {savedRules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logic Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {savedRules && savedRules.map((rule) => (
                          <tr key={rule._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.logicType === 'AND' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {rule.logicType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">
                                {rule.rules && rule.rules.map((cond, idx) => (
                                  <div key={idx} className="mb-1">
                                    {conditionTypes.find(type => type.id === cond.field)?.label || cond.field} {cond.operator} {cond.value}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(rule.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No segment rules saved yet.</p>
                    <button
                      onClick={handleCreateNew}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                      Create Your First Rule
                    </button>
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

export default SegmentRules;
