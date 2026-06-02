import React from 'react';
import { Layout, Button, ConfigProvider, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { msalInstance } from './services/api';
import { TicketTable } from './components/TicketTable';
import './App.css';

const { Header, Content } = Layout;

const LoginButton: React.FC = () => {
  const { instance, accounts } = useMsal();

  return (
    <>
      <AuthenticatedTemplate>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 }}
          />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {accounts[0]?.name || accounts[0]?.username}
          </span>
          <Button
            icon={<LogoutOutlined />}
            size="small"
            onClick={() => instance.logoutRedirect()}
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', background: 'transparent' }}
          >
            Logout
          </Button>
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Button
          type="primary"
          icon={<LoginOutlined />}
          onClick={() => instance.loginRedirect()}
          ghost
        >
          Login
        </Button>
      </UnauthenticatedTemplate>
    </>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 8,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Table: {
            headerBg: '#f8fafc',
            rowHoverBg: '#f1f5f9',
          },
        },
      }}
    >
      <MsalProvider instance={msalInstance}>
        <Layout style={{ minHeight: '100vh', background: '#f1f5f9' }}>
          <Header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)',
              padding: '0 32px',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                🎫
              </div>
              <span style={{ color: 'white', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
                Ticketing System
              </span>
            </div>
            <LoginButton />
          </Header>

          <Content style={{ padding: '32px 32px', minHeight: 'calc(100vh - 64px)' }}>
            <AuthenticatedTemplate>
              <TicketTable />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'calc(100vh - 128px)',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    background: 'white',
                    padding: '56px 48px',
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                    maxWidth: 480,
                    width: '100%',
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎫</div>
                  <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#111827' }}>
                    Ticketing System
                  </h1>
                  <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, lineHeight: 1.6 }}>
                    Accedi con il tuo account Azure AD per gestire i ticket di supporto.
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<LoginOutlined />}
                    style={{ paddingLeft: 32, paddingRight: 32, height: 44 }}
                    onClick={() => msalInstance.loginRedirect()}
                  >
                    Accedi con Azure AD
                  </Button>
                </div>
              </div>
            </UnauthenticatedTemplate>
          </Content>
        </Layout>
      </MsalProvider>
    </ConfigProvider>
  );
}

export default App;
