import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#333'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>BallFX Config UI</h1>
        <p>Visual configuration wizard - Coming soon</p>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
