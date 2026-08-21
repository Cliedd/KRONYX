import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Apply persisted theme before first render to avoid flash
try {
  const stored = localStorage.getItem('kronyx-theme');
  const theme = stored ? (JSON.parse(stored) as { state?: { theme?: string } })?.state?.theme : null;
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
} catch {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
