import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Set base URL for all axios requests.
// In production (Render Static Site), VITE_API_URL points to the backend Render service.
// In development, it falls back to '' so Vite's dev-server proxy handles /api/* calls.
const apiBase = import.meta.env.VITE_API_URL || '';
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
