interface AirtableBase {
  id: string;
  name: string;
  tables: AirtableTable[];
}

interface AirtableTable {
  id: string;
  name: string;
  fields: AirtableField[];
}

interface AirtableField {
  id: string;
  name: string;
  type: string;
}

class AirtableService {
  private apiKey: string | null = null;
  private baseId: string | null = null;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    return this;
  }

  setBaseId(baseId: string) {
    this.baseId = baseId;
    return this;
  }

  async getBases(): Promise<AirtableBase[]> {
    if (!this.apiKey) {
      throw new Error('API key is not set');
    }

    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bases: ${response.statusText}`);
      }

      const data = await response.json();
      return data.bases.map((base: any) => ({
        id: base.id,
        name: base.name,
        tables: [],
      }));
    } catch (error) {
      console.error('Error fetching Airtable bases:', error);
      throw error;
    }
  }

  async getTables(): Promise<AirtableTable[]> {
    if (!this.apiKey || !this.baseId) {
      throw new Error('API key or base ID is not set');
    }

    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
        })),
      }));
    } catch (error) {
      console.error('Error fetching Airtable tables:', error);
      throw error;
    }
  }

  async getRecords(tableId: string, params: { fields?: string[]; maxRecords?: number; view?: string } = {}): Promise<any[]> {
    if (!this.apiKey || !this.baseId) {
      throw new Error('API key or base ID is not set');
    }

    try {
      let url = `https://api.airtable.com/v0/${this.baseId}/${tableId}`;
      
      // Add query parameters
      const queryParams: string[] = [];
      if (params.fields && params.fields.length > 0) {
        params.fields.forEach(field => {
          queryParams.push(`fields[]=${encodeURIComponent(field)}`);
        });
      }
      
      if (params.maxRecords) {
        queryParams.push(`maxRecords=${params.maxRecords}`);
      }
      
      if (params.view) {
        queryParams.push(`view=${encodeURIComponent(params.view)}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error('Error fetching Airtable records:', error);
      throw error;
    }
  }
}

export const airtableService = new AirtableService();