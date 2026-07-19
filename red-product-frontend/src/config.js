// Configuration centralisée de l'adresse de l'API avec nettoyage automatique de l'URL
let rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// Enlever les slashes de fin superflus
rawUrl = rawUrl.trim().replace(/\/+$/, '')

// Si l'URL ne se termine pas par /api, on le rajoute automatiquement
if (!rawUrl.endsWith('/api')) {
  rawUrl += '/api'
}

export const API_BASE_URL = rawUrl
