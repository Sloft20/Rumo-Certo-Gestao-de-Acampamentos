import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o app sozinho quando você lançar versões novas
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // O SEGREDO DO OFFLINE: Manda o celular salvar TUDO isso!
      },
      manifest: {
        name: 'Rumo Certo Acampamento',
        short_name: 'Rumo Certo',
        description: 'Gestão Financeira e Controle de Acampantes',
        theme_color: '#0f172a', // A cor da barra superior do celular (Modo Escuro)
        background_color: '#f8fafc', // A cor da tela de carregamento
        display: 'standalone', // ESTE É O COMANDO QUE TIRA A BARRA DO NAVEGADOR
        icons: [
          {
            src: 'logo.png', // Usando a logo que você já tem na pasta public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})