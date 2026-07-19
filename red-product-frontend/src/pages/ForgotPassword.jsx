import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import bgImage from '../assets/background.jpg'
import { API_BASE_URL } from '../config'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/forgot-password/`, {
        email: email
      })
      setSuccessMessage(response.data.message || "Un e-mail de réinitialisation vous a été envoyé.")
      setEmail('')
    } catch (err) {
      console.error("Erreur lors de la demande de mot de passe oublié :", err)
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       "Une erreur est survenue. Veuillez vérifier votre adresse email."
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
          <h2 className="text-[#333333] text-lg font-semibold mb-3">
            Mot de passe oublié?
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Entrez votre adresse e-mail ci-dessous et nous vous envoyons des instructions sur la façon de modifier votre mot de passe.
          </p>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs py-2.5 px-4 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-2.5 px-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* E-mail */}
            <div>
              <input
                id="email"
                type="email"
                required
                placeholder="Votre e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
                disabled={loading}
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium py-3 rounded-md transition duration-200 mt-4 shadow-sm ${
                loading ? 'opacity-75 cursor-wait' : ''
              }`}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>

        {/* Liens bas de page */}
        <div className="text-center mt-6">
          <div className="text-gray-300 text-sm">
            Revenir à la{' '}
            <Link to="/login" className="text-[#FFD964] hover:underline font-semibold">
              connexion
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword
