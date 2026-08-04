import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Global fetch interceptor to attach LLM API Key to all backend requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) config = {};
  
  const llmApiKey = localStorage.getItem('llm_api_key');
  if (llmApiKey) {
    if (!config.headers) {
      config.headers = {};
    }
    if (config.headers instanceof Headers) {
      config.headers.set('X-LLM-API-Key', llmApiKey);
    } else {
      config.headers = { ...config.headers, 'X-LLM-API-Key': llmApiKey };
    }
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
