import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import './App.css';
import ChatInterface from './components/ChatInterface';
import AuthWrapper from './components/AuthWrapper';
import { awsConfig, devConfig } from './aws-config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Configure Amplify only in production
    if (!devConfig.isDevelopment && awsConfig.Auth.userPoolId) {
      Amplify.configure(awsConfig);
    }
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌲 PNW Hiking Assistant</h1>
        <p>Your AI guide to Pacific Northwest trails</p>
      </header>
      
      <main className="app-main">
        {process.env.NODE_ENV === 'development' ? (
          // Skip auth in development
          <ChatInterface />
        ) : (
          <AuthWrapper onAuthChange={setIsAuthenticated}>
            {isAuthenticated && <ChatInterface />}
          </AuthWrapper>
        )}
      </main>
    </div>
  );
}

export default App;