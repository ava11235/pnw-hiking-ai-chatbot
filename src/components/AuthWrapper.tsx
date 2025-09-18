import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

interface AuthWrapperProps {
  children: React.ReactNode;
  onAuthChange: (isAuthenticated: boolean) => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, onAuthChange }) => {
  return (
    <Authenticator
      signUpAttributes={['email']}
      socialProviders={[]}
      variation="modal"
      components={{
        Header() {
          return (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <h2 style={{ color: '#2d5a27', marginBottom: '0.5rem' }}>
                🌲 Welcome to PNW Hiking Assistant
              </h2>
              <p style={{ color: '#6c757d' }}>
                Sign in to get personalized hiking recommendations
              </p>
            </div>
          );
        },
      }}
    >
      {({ signOut, user }) => {
        onAuthChange(!!user);
        return (
          <div style={{ width: '100%' }}>
            <div style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: '1rem',
              zIndex: 1000
            }}>
              <button
                onClick={signOut}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Sign Out
              </button>
            </div>
            {children}
          </div>
        );
      }}
    </Authenticator>
  );
};

export default AuthWrapper;