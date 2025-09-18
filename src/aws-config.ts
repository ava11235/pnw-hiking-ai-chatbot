// This file will be updated with actual values after CDK deployment
export const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-west-2',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
    mandatorySignIn: true,
  },
  API: {
    endpoints: [
      {
        name: 'ChatAPI',
        endpoint: process.env.REACT_APP_API_URL || '',
        region: process.env.REACT_APP_AWS_REGION || 'us-west-2',
      }
    ]
  }
};

// Development configuration (when running locally)
export const devConfig = {
  apiUrl: 'http://localhost:3005/api/chat',
  isDevelopment: process.env.NODE_ENV === 'development'
};