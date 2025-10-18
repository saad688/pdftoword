import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App.tsx';
import '../styles/globals.css';

// Safe root element access with error handling
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a div with id="root" in your HTML.');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback error display
  rootElement.innerHTML = '<div style="padding: 20px; color: red;">Failed to load application. Please refresh the page.</div>';
}
