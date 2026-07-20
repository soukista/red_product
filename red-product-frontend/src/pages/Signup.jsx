import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import bgImage from '../assets/background.jpg'
import { API_BASE_URL } from '../config'

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!acceptTerms) {
      setError('Veuillez accepter les termes et politiques.')
      return
    }
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/accounts/register/`, {
        first_name: name,
        email: email,
        password: password
      })
      setSuccessMsg('Inscription réussie ! Redirection vers la page de connexion...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.email?.[0] || 
                       err.response?.data?.password?.[0] || 
                       err.response?.data?.detail || 
                       "Erreur lors de l'inscription. L'email est peut-être déjà utilisé."
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
            Inscrivez-vous en tant que Admin
          </h2>

          {/* Affichage des erreurs d'API */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded mb-4 text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Banner de succès */}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 text-xs py-2 px-3 rounded mb-4 text-center font-medium border border-emerald-200 shadow-sm flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
              />
            </div>

            {/* E-mail */}
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

            {/* Mot de passe */}
            <div>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
              />
            </div>

            {/* Checkbox Termes */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="accept-terms" className="text-sm text-gray-600 cursor-pointer select-none">
                Accepter les termes et la politique
              </label>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium py-3 rounded-md transition duration-200 mt-4 shadow-sm ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>
        </div>

        {/* Liens bas de page */}
        <div className="text-center mt-6">
          <div className="text-gray-300 text-sm">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-[#FFD964] hover:underline font-semibold">
              Se connecter
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Signup
