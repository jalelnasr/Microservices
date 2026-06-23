import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ← change juste cette ligne

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);