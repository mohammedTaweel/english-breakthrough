import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Storage polyfill — uses localStorage when window.storage (Claude artifacts) is unavailable
if (!window.storage) {
  window.storage = {
    async get(key) {
      try {
        const val = localStorage.getItem(key);
        return val ? { key, value: val } : null;
      } catch { return null; }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value);
        return { key, value };
      } catch { return null; }
    },
    async delete(key) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch { return null; }
    },
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
