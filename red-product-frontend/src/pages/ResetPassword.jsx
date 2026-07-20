import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import bgImage from '../assets/background.jpg'
import { API_BASE_URL } from '../config'

function ResetPassword() {
  const { uidb64, token } = useParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères.')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/reset-password-confirm/`, {
        uidb64: uidb64,
        token: token,
        new_password: newPassword
      })

      setSuccessMessage(response.data.message || 'Votre mot de passe a été réinitialisé avec succès !')
      setNewPassword('')
      setConfirmPassword('')

      // Redirection automatique vers la connexion après 3 secondes
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      console.error('Erreur réinitialisation mot de passe :', err)
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       'Le lien de réinitialisation est invalide ou a expiré.'
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
            Définir un nouveau mot de passe
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Veuillez saisir votre nouveau mot de passe ci-dessous.
          </p>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs py-3 px-4 rounded-lg mb-4 flex flex-col items-center gap-2 text-center">
              <span>{successMessage}</span>
              <span className="text-[11px] text-green-600">Redirection vers la page de connexion...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-2.5 px-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nouveau mot de passe</label>
                <input
                  id="new-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-300 focus:border-gray-600 focus:ring-0 outline-none py-2 text-gray-700 placeholder-gray-400 transition"
                  disabled={loading}
                />
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Confirmer le mot de passe</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Réinitialisation...' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          )}
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

export default ResetPassword
