import React from 'react';
import { Layout, Button } from 'antd';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { msalInstance } from './services/api';
import { TicketTable } from './components/TicketTable';
import './App.css';

const { Header, Content } = Layout;

const LoginButton: React.FC = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect();
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <>
      <AuthenticatedTemplate>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white' }}>
            Benvenuto, {accounts[0]?.name || accounts[0]?.username}
          </span>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button type="primary" onClick={handleLogin}>Login</Button>
      </UnauthenticatedTemplate>
    </>
  );
};

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px'
        }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            Sistema di Gestione Ticket
          </div>
          <LoginButton />
        </Header>
        <Content style={{ padding: '24px', background: '#f0f2f5' }}>
          <AuthenticatedTemplate>
            <TicketTable />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '100px',
              background: 'white',
              padding: '48px',
              borderRadius: '8px',
              maxWidth: '600px',
              margin: '100px auto'
            }}>
              <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>
                Benvenuto nel Sistema di Ticketing
              </h1>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
                Effettua il login con Azure AD per accedere all'applicazione
              </p>
              <Button type="primary" size="large" onClick={() => msalInstance.loginRedirect()}>
                Accedi con Azure AD
              </Button>
            </div>
          </UnauthenticatedTemplate>
        </Content>
      </Layout>
    </MsalProvider>
  );
}

export default App;
