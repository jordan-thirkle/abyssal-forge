/**
 * @description React entry point — mounts App over Babylon.js canvas
 * @author Abyssal Forge
 * @version 1.0.0
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
