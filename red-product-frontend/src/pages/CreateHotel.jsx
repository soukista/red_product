import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import { API_BASE_URL } from '../config'

function CreateHotel() {
  const navigate = useNavigate()
  
  // États des champs du formulaire
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('F XOF')
  
  // États pour le sélecteur de fichier
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Redimensionner et compresser l'image à 800px de large max (haute qualité et netteté garantie)
  const resizeAndCompressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 800
          
          let width = img.width
          let height = img.height
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Exportation en JPEG de qualité 90% pour un rendu cristallin et léger
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9)
          resolve(compressedBase64)
        }
      }
    })
  }

  // Gérer la sélection du fichier image
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Générer une URL d'aperçu local temporaire
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) {
      setError("Vous devez être connecté pour effectuer cette action.")
      setLoading(false)
      return
    }

    // Nettoyage et formatage du prix pour Django (Ex: "25.000" devient 25000)
    const cleanPrice = parseFloat(price.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.'))
    
    // Correspondance de la devise pour correspondre aux choix de la BDD (XOF, EUR, USD)
    const mappedCurrency = currency === 'F XOF' ? 'XOF' : currency === 'Euro' ? 'EUR' : 'USD'

    // Vérification obligatoire de la sélection d'une photo
    if (!selectedFile) {
      setError("La photo de l'hôtel est obligatoire. Veuillez sélectionner un fichier d'image.")
      setLoading(false)
      return
    }

    // Conversion et redimensionnement de l'image sélectionnée en Base64
    let finalImage = ''
    try {
      finalImage = await resizeAndCompressImage(selectedFile)
    } catch (err) {
      console.error("Erreur lors du redimensionnement de l'image :", err)
      setError("Erreur lors du traitement de l'image. Veuillez sélectionner un autre fichier.")
      setLoading(false)
      return
    }

    const payload = {
      name: name,
      address: address,
      email: email,
      phone: phone,
      price_per_night: isNaN(cleanPrice) ? 0 : cleanPrice,
      currency: mappedCurrency,
      image: finalImage
    }

    try {
      await axios.post(`${API_BASE_URL}/hotels/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setSuccessMsg(`Hôtel "${name}" créé avec succès ! Redirection...`)
      setTimeout(() => {
        navigate('/hotels')
      }, 1200)
    } catch (err) {
      console.error("Erreur lors de la création de l'hôtel :", err)
      const errorMsg = err.response?.data?.name?.[0] || 
                       err.response?.data?.email?.[0] || 
                       err.response?.data?.price_per_night?.[0] ||
                       err.response?.data?.detail || 
                       "Impossible d'enregistrer l'hôtel. Veuillez vérifier les champs."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Créer un nouveau hôtel">
      
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/hotels" className="text-gray-500 hover:text-gray-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h2 className="text-lg font-bold text-gray-700 uppercase tracking-wide">
          Créer un nouveau hôtel
        </h2>
      </div>

      {/* Affichage des erreurs d'API */}
      {error && (
        <div className="bg-red-50 text-red-600 text-xs py-2.5 px-4 rounded-lg mb-6 border border-red-100 max-w-4xl">
          {error}
        </div>
      )}

      {/* Banner de succès */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-3 px-4 rounded-lg mb-6 border border-emerald-200 shadow-sm flex items-center space-x-2 max-w-4xl">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Main Container Card (White background, thin border) */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Double Column Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Nom de l'hôtel */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-name">
                  Nom de l'hôtel
                </label>
                <input
                  id="hotel-name"
                  type="text"
                  required
                  placeholder="Ex: CAP Marniane"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 transition"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-email">
                  E-mail
                </label>
                <input
                  id="hotel-email"
                  type="email"
                  required
                  placeholder="Ex: information@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 transition"
                />
              </div>

              {/* Prix par nuit */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-price">
                  Prix par nuit
                </label>
                <input
                  id="hotel-price"
                  type="text"
                  required
                  placeholder="Ex: 25.000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 transition"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-address">
                  Adresse
                </label>
                <input
                  id="hotel-address"
                  type="text"
                  required
                  placeholder="Ex: Les îles du saloum, Mar Lodj"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 transition"
                />
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-phone">
                  Numéro de téléphone
                </label>
                <input
                  id="hotel-phone"
                  type="text"
                  required
                  placeholder="Ex: +221 77 777 77 77"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 transition"
                />
              </div>

              {/* Devise */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5" htmlFor="hotel-currency">
                  Devise
                </label>
                <select
                  id="hotel-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white transition cursor-pointer"
                >
                  <option value="F XOF">F XOF</option>
                  <option value="Euro">Euro</option>
                  <option value="Dollar">Dollar</option>
                </select>
              </div>
            </div>

          </div>

          {/* Full Width Photo Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Ajouter une photo
            </label>
            
            {/* Hidden Input File */}
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Dashed Drag/Drop Box */}
            <div 
              onClick={() => document.getElementById('file-upload').click()}
              className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer relative overflow-hidden"
            >
              {previewUrl ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/5">
                  <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-150">
                    <span className="text-white text-sm font-semibold">Changer la photo</span>
                  </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Ajouter une photo</span>
                </>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium px-6 py-3 rounded-lg text-sm shadow-sm transition duration-150 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Enregistrement en cours...' : 'Enregistrer'}
            </button>
          </div>

        </form>
      </div>

    </DashboardLayout>
  )
}

export default CreateHotel
