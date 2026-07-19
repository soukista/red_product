import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import bgImage from '../assets/background.jpg'
import { API_BASE_URL } from '../config'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepConnected, setKeepConnected] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/login/`, {
        email: email,
        password: password
      })

      // Stocker les tokens et infos de l'utilisateur selon la case "Gardez-moi connecté"
      const storage = keepConnected ? localStorage : sessionStorage
      storage.setItem('access_token', response.data.access)
      storage.setItem('refresh_token', response.data.refresh)
      storage.setItem('user_name', response.data.user.name || 'sakina kane')
      storage.setItem('user_email', response.data.user.email)

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.non_field_errors?.[0] || 
                       'Identifiants incorrects. Veuillez réessayer.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#494C4F] flex flex-col justify-center items-center font-sans overflow-hidden">
      {/* Image de fond Figma avec mode de fusion Multiply et opacité de 90% */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center mix-blend-multiply opacity-[0.9] pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-8 h-8 text-white"
            role="img"
            aria-label="Logo Red Product"
          >
            <path d="M4 4h16v16l-8-8l-8 8z" />
          </svg>
          <span className="text-white font-bold tracking-wider text-xl uppercase">Red Product</span>
        </div>

        {/* Card Formulaire */}
        <div className="bg-[#FFFFFF] rounded-md shadow-xl p-8">
          <h2 className="text-[#333333] text-lg font-semibold mb-6">
            Connectez-vous en tant que Admin
          </h2>

          {/* Affichage des erreurs d'API */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded mb-4 text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ E-mail */}
            <div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
              />
            </div>

            {/* Checkbox Gardez-moi connecté */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="keep-connected"
                type="checkbox"
                checked={keepConnected}
                onChange={(e) => setKeepConnected(e.target.checked)}
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="keep-connected" className="text-sm text-gray-600 cursor-pointer select-none">
                Gardez-moi connecté
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium py-3 rounded-md transition duration-200 mt-4 shadow-sm ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Liens */}
        <div className="text-center mt-6 space-y-2">
          <div>
            <Link to="/forgot-password" className="text-[#FFD964] hover:underline text-sm font-medium">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="text-gray-300 text-sm">
            Vous n'avez pas de compte ?{' '}
            <Link to="/signup" className="text-[#FFD964] hover:underline font-semibold">
              S'inscrire
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login
