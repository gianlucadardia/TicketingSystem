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
          scopes: [`api://${process.env.REACT_APP_AZURE_CLIENT_ID}/access_as_user`],
          account: accounts[0]
        });
        config.headers.Authorization = `Bearer ${response.accessToken}`;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await msalInstance.acquireTokenRedirect({
            scopes: [`api://${process.env.REACT_APP_AZURE_CLIENT_ID}/access_as_user`],
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
