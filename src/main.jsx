import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Adicione esta importação:
import { registerSW } from 'virtual:pwa-register' 

// Inicializa o Service Worker para o modo Offline
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)