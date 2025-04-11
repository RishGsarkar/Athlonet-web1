import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css'; // Import global styles
import './styles/components.css'; // Import component-specific styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);