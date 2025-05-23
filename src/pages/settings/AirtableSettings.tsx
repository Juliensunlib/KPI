import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../services/supabaseClient';
import { airtableService } from '../../services/airtableService';
import { Database, Key, Check, Loader2 } from 'lucide-react';

interface AirtableConfig {
  id: string;
  api_key: string;
  base_id: string | null;
}

const AirtableSettings = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [apiKey, setApiKey] = useState('');
  const [baseId, setBaseId] = useState('');
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [bases, setBases] = useState<{ id: string; name: string }[]>([]);
  const [fetchingBases, setFetchingBases] = useState(false);
  
  useEffect(() => {
    const fetchAirtableConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('airtable_configs')
          .select('*')
          .eq('user_id', user?.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          // Mask API key for display
          setApiKey(data.api_key);
          setBaseId(data.base_id || '');
          setConfigId(data.id);
        }
      } catch (error) {
        console.error('Error fetching Airtable config:', error);
        addToast('error', 'Failed to load Airtable settings');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchAirtableConfig();
    }
  }, [user, addToast]);
  
  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      addToast('error', 'API key is required');
      return;
    }
    
    setSavingConfig(true);
    
    try {
      if (configId) {
        // Update existing config
        const { error } = await supabase
          .from('airtable_configs')
          .update({
            api_key: apiKey,
            base_id: baseId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', configId);
          
        if (error) throw error;
        
        addToast('success', 'Airtable settings updated successfully');
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('airtable_configs')
          .insert([
            {
              user_id: user?.id,
              api_key: apiKey,
              base_id: baseId || null,
            },
          ])
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          setConfigId(data[0].id);
        }
        
        addToast('success', 'Airtable settings saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving Airtable config:', error);
      addToast('error', error.message || 'Failed to save Airtable settings');
    } finally {
      setSavingConfig(false);
    }
  };
  
  const testConnection = async () => {
    if (!apiKey) {
      addToast('error', 'API key is required');
      return;
    }
    
    setTestingConnection(true);
    
    try {
      // Test connection by fetching bases
      const fetchedBases = await airtableService.setApiKey(apiKey).getBases();
      addToast('success', 'Connection successful! Airtable API key is valid.');
      
      // Set bases for selection
      setBases(fetchedBases);
    } catch (error: any) {
      console.error('Error testing Airtable connection:', error);
      addToast('error', error.message || 'Failed to connect to Airtable API');
    } finally {
      setTestingConnection(false);
    }
  };
  
  const fetchBases = async () => {
    if (!apiKey) {
      addToast('error', 'API key is required');
      return;
    }
    
    setFetchingBases(true);
    
    try {
      const fetchedBases = await airtableService.setApiKey(apiKey).getBases();
      setBases(fetchedBases);
    } catch (error: any) {
      console.error('Error fetching Airtable bases:', error);
      addToast('error', error.message || 'Failed to fetch Airtable bases');
    } finally {
      setFetchingBases(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Database className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Airtable Settings</h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          Connect your Airtable account to access your bases and create KPIs and dashboards.
        </p>
        
        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Airtable API Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="apiKey"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-20 sm:text-sm border-gray-300 rounded-md py-2 border"
                placeholder="Enter your Airtable API key"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection || !apiKey}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-1" />
                      Testing
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Test
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              You can find your API key in your{' '}
              <a
                href="https://airtable.com/account"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                Airtable account settings
              </a>
              .
            </p>
          </div>
          
          {/* Base Selection */}
          <div>
            <label htmlFor="baseId" className="block text-sm font-medium text-gray-700 mb-1">
              Airtable Base
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <select
                id="baseId"
                name="baseId"
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 py-2 border"
              >
                <option value="">Select a base</option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={fetchBases}
                disabled={fetchingBases || !apiKey}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
              >
                {fetchingBases ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                savingConfig ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {savingConfig ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Additional Information */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800">About Airtable API Access</h3>
        <div className="mt-2 text-sm text-blue-700">
          <p className="mb-2">
            Your Airtable API key is stored securely and is used to access your Airtable data for creating KPIs and dashboards.
          </p>
          <p>
            To maintain security, we recommend creating a dedicated API key with limited access for this application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AirtableSettings;