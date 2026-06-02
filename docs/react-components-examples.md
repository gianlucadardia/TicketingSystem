# Esempi Componenti React

Questi esempi mostrano come implementare i componenti principali del frontend.

## 1. src/services/api.ts

```typescript
import axios from 'axios';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per aggiungere il token JWT
apiClient.interceptors.request.use(
  async (config) => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      try {
        const response = await msalInstance.acquireTokenSilent({
          scopes: ['api://YOUR_BACKEND_CLIENT_ID/access_as_user'],
          account: accounts[0]
        });
        config.headers.Authorization = `Bearer ${response.accessToken}`;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await msalInstance.acquireTokenRedirect({
            scopes: ['api://YOUR_BACKEND_CLIENT_ID/access_as_user'],
            account: accounts[0]
          });
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      msalInstance.loginRedirect();
    }
    return Promise.reject(error);
  }
);
```

## 2. src/services/ticketService.ts

```typescript
import { apiClient } from './api';
import { TicketAperto } from '../types/models';

export const ticketService = {
  getAll: async (): Promise<TicketAperto[]> => {
    const response = await apiClient.get<TicketAperto[]>('/tickets');
    return response.data;
  },

  getById: async (id: number): Promise<TicketAperto> => {
    const response = await apiClient.get<TicketAperto>(`/tickets/${id}`);
    return response.data;
  },

  create: async (ticket: Partial<TicketAperto>): Promise<TicketAperto> => {
    const response = await apiClient.post<TicketAperto>('/tickets', ticket);
    return response.data;
  },

  update: async (id: number, ticket: Partial<TicketAperto>): Promise<void> => {
    await apiClient.put(`/tickets/${id}`, ticket);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },

  search: async (query: string, stato?: string, competenzaId?: number): Promise<TicketAperto[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (stato) params.append('stato', stato);
    if (competenzaId) params.append('competenzaId', competenzaId.toString());
    
    const response = await apiClient.get<TicketAperto[]>(`/tickets/search?${params}`);
    return response.data;
  }
};
```

## 3. src/components/TicketTable.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { TicketAperto } from '../types/models';
import { ticketService } from '../services/ticketService';
import { ForeignKeySelect } from './ForeignKeySelect';

const { Search } = Input;

export const TicketTable: React.FC = () => {
  const [tickets, setTickets] = useState<TicketAperto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<number | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      message.error('Errore nel caricamento dei ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    try {
      const data = await ticketService.search(value);
      setTickets(data);
    } catch (error) {
      message.error('Errore nella ricerca');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: TicketAperto) => {
    setEditingKey(record.id!);
  };

  const handleSave = async (record: TicketAperto) => {
    try {
      await ticketService.update(record.id!, record);
      message.success('Ticket aggiornato con successo');
      setEditingKey(null);
      loadTickets();
    } catch (error) {
      message.error('Errore nell\'aggiornamento del ticket');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ticketService.delete(id);
      message.success('Ticket eliminato con successo');
      loadTickets();
    } catch (error) {
      message.error('Errore nell\'eliminazione del ticket');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Titolo',
      dataIndex: 'titolo',
      key: 'titolo',
      editable: true,
    },
    {
      title: 'Descrizione',
      dataIndex: 'descrizione',
      key: 'descrizione',
      editable: true,
      ellipsis: true,
    },
    {
      title: 'Competenza',
      dataIndex: 'competenzaId',
      key: 'competenzaId',
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            record.competenzaId = val;
          }}
          type="competenza"
          disabled={editingKey !== record.id}
        />
      ),
    },
    {
      title: 'Macro Causa',
      dataIndex: 'macroCausaId',
      key: 'macroCausaId',
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            record.macroCausaId = val;
            record.causaId = undefined; // Reset causa quando cambia macro
          }}
          type="macrocausa"
          disabled={editingKey !== record.id}
        />
      ),
    },
    {
      title: 'Causa',
      dataIndex: 'causaId',
      key: 'causaId',
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            record.causaId = val;
          }}
          type="causa"
          macroCausaId={record.macroCausaId}
          disabled={editingKey !== record.id || !record.macroCausaId}
        />
      ),
    },
    {
      title: 'Stato',
      dataIndex: 'stato',
      key: 'stato',
      render: (value: string, record: TicketAperto) => (
        <Select
          value={value}
          onChange={(val) => {
            record.stato = val;
          }}
          disabled={editingKey !== record.id}
          style={{ width: 120 }}
        >
          <Select.Option value="Aperto">Aperto</Select.Option>
          <Select.Option value="In Lavorazione">In Lavorazione</Select.Option>
          <Select.Option value="Risolto">Risolto</Select.Option>
          <Select.Option value="Chiuso">Chiuso</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Priorità',
      dataIndex: 'priorita',
      key: 'priorita',
      render: (value: string, record: TicketAperto) => (
        <Select
          value={value}
          onChange={(val) => {
            record.priorita = val;
          }}
          disabled={editingKey !== record.id}
          style={{ width: 100 }}
        >
          <Select.Option value="Bassa">Bassa</Select.Option>
          <Select.Option value="Media">Media</Select.Option>
          <Select.Option value="Alta">Alta</Select.Option>
          <Select.Option value="Critica">Critica</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Azioni',
      key: 'actions',
      render: (text: any, record: TicketAperto) => (
        <Space>
          {editingKey === record.id ? (
            <>
              <Button type="primary" onClick={() => handleSave(record)}>
                Salva
              </Button>
              <Button onClick={() => setEditingKey(null)}>
                Annulla
              </Button>
            </>
          ) : (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              >
                Modifica
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(record.id!)}
              >
                Elimina
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Cerca ticket..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 400 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Totale ${total} ticket`,
        }}
      />
    </div>
  );
};
```

## 4. src/components/ForeignKeySelect.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { apiClient } from '../services/api';
import { Competenza, MacroCausa, Causa } from '../types/models';

interface Props {
  value?: number;
  onChange?: (value: number | undefined) => void;
  type: 'competenza' | 'macrocausa' | 'causa';
  macroCausaId?: number; // Required for 'causa' type
  disabled?: boolean;
}

export const ForeignKeySelect: React.FC<Props> = ({
  value,
  onChange,
  type,
  macroCausaId,
  disabled
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [type, macroCausaId]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'competenza':
          endpoint = '/competenze';
          break;
        case 'macrocausa':
          endpoint = '/macrocause';
          break;
        case 'causa':
          endpoint = macroCausaId 
            ? `/cause/bymacrocausa/${macroCausaId}`
            : '/cause';
          break;
      }
      
      const response = await apiClient.get(endpoint);
      setOptions(response.data);
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={`Seleziona ${type}`}
      allowClear
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options.map((opt) => ({
        value: opt.id,
        label: opt.nome
      }))}
      loading={loading}
      disabled={disabled || (type === 'causa' && !macroCausaId)}
      style={{ width: '100%', minWidth: 150 }}
    />
  );
};
```

## 5. src/App.tsx

```typescript
import React from 'react';
import { Layout, Menu } from 'antd';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { msalInstance } from './services/api';
import { TicketTable } from './components/TicketTable';
import './App.css';

const { Header, Content } = Layout;

const LoginButton: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect();
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <>
      <AuthenticatedTemplate>
        <button onClick={handleLogout}>Logout</button>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button onClick={handleLogin}>Login</button>
      </UnauthenticatedTemplate>
    </>
  );
};

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontSize: '20px' }}>
            Sistema di Ticketing
          </div>
          <LoginButton />
        </Header>
        <Content style={{ padding: '24px' }}>
          <AuthenticatedTemplate>
            <TicketTable />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h2>Benvenuto nel Sistema di Ticketing</h2>
              <p>Effettua il login per continuare</p>
            </div>
          </UnauthenticatedTemplate>
        </Content>
      </Layout>
    </MsalProvider>
  );
}

export default App;
```

## 6. src/index.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Note di Implementazione

1. **Sostituire `YOUR_BACKEND_CLIENT_ID`** in `api.ts` con il Client ID dell'API backend registrata in Azure AD

2. **Configurare i scope** corretti per l'API backend in Azure AD

3. **Aggiungere gestione errori** più robusta nei componenti

4. **Implementare lo stato globale** con Context API o Redux se necessario

5. **Aggiungere validazione** dei form con Ant Design Form

6. **Implementare CommentiPanel** per visualizzare e aggiungere commenti ai ticket

7. **Aggiungere ImportDialog** per l'importazione CSV

8. **Implementare routing** con React Router se necessario per pagine multiple

## Dipendenze package.json

```json
{
  "dependencies": {
    "@azure/msal-browser": "^3.0.0",
    "@azure/msal-react": "^2.0.0",
    "antd": "^5.0.0",
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-router-dom": "^5.3.3",
    "typescript": "^5.3.0"
  }
}
```

Questi esempi forniscono una base solida per implementare il frontend dell'applicazione.
