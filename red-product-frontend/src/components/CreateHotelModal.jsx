import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

// Validation numéro sénégalais: commence par 70, 75, 76, 77, ou 78 + 7 chiffres (9 total)
const validateSenegalPhone = (phone) => {
  if (!phone || !phone.trim()) return true // Champ optionnel
  const cleaned = phone.replace(/[\s\-().+]/g, '')
  // Retirer le préfixe pays 221 si présent
  const local = cleaned.startsWith('221') ? cleaned.slice(3) : cleaned
  return /^7[05678]\d{7}$/.test(local)
}

function CreateHotelModal({ onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('F XOF')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const resizeAndCompressImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 600
          let width = img.width
          let height = img.height
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = () => resolve('')
      }
      reader.onerror = () => resolve('')
    })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value
    setPhone(val)
    if (val.trim() && !validateSenegalPhone(val)) {
      setPhoneError('Numéro invalide. Doit commencer par 70, 75, 76, 77 ou 78 (ex: 77 123 45 67)')
    } else {
      setPhoneError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (phone.trim() && !validateSenegalPhone(phone)) {
      setPhoneError('Numéro de téléphone sénégalais invalide.')
      return
    }
    if (!selectedFile) {
      setError("La photo de l'hôtel est obligatoire.")
      return
    }

    setLoading(true)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) { setError("Vous devez être connecté."); setLoading(false); return }

    const cleanPrice = parseFloat(price.replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '.'))
    const mappedCurrency = currency === 'F XOF' ? 'XOF' : currency === 'Euro' ? 'EUR' : 'USD'
    let finalImage = ''
    try { finalImage = await resizeAndCompressImage(selectedFile) }
    catch { setError("Erreur lors du traitement de l'image."); setLoading(false); return }

    const payload = {
      name, address, email, phone,
      price_per_night: isNaN(cleanPrice) ? 0 : cleanPrice,
      currency: mappedCurrency,
      image: finalImage
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/hotels/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onSuccess(response.data)
    } catch (err) {
      const errorMsg = err.response?.data?.name?.[0] ||
                       err.response?.data?.email?.[0] ||
                       err.response?.data?.price_per_night?.[0] ||
                       err.response?.data?.detail ||
                       "Impossible d'enregistrer l'hôtel."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">Créer un nouvel hôtel</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer rounded-full p-1 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs py-2.5 px-4 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="create-hotel-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Colonne gauche */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom de l'hôtel *</label>
                  <input type="text" required placeholder="Ex: CAP Marniane"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-mail</label>
                  <input type="email" required placeholder="Ex: hotel@gmail.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prix par nuit *</label>
                  <input type="text" required placeholder="Ex: 25000"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 transition" />
                </div>
              </div>

              {/* Colonne droite */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adresse *</label>
                  <input type="text" required placeholder="Ex: Les îles du Saloum, Mar Lodj"
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Téléphone
                    <span className="text-gray-400 font-normal ml-1">(Sénégal)</span>
                  </label>
                  <input type="tel" placeholder="Ex: 77 123 45 67"
                    value={phone} onChange={handlePhoneChange}
                    className={`w-full border ${phoneError ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 transition`} />
                  {phoneError
                    ? <p className="text-red-500 text-[11px] mt-1">{phoneError}</p>
                    : <p className="text-gray-400 text-[11px] mt-1">Commence par 70, 75, 76, 77 ou 78 — 9 chiffres</p>
                  }
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Devise</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-gray-200 focus:border-gray-400 outline-none rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white transition cursor-pointer">
                    <option value="F XOF">F XOF</option>
                    <option value="Euro">Euro</option>
                    <option value="Dollar">Dollar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Zone de photo */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Photo de l'hôtel *</label>
              <input type="file" id="modal-file-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => document.getElementById('modal-file-upload').click()}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer relative overflow-hidden"
              >
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-150">
                      <span className="text-white text-sm font-semibold">Changer la photo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400 text-sm">Cliquer pour ajouter une photo</span>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Pied de modal (boutons) */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition cursor-pointer">
            Annuler
          </button>
          <button
            type="submit"
            form="create-hotel-form"
            disabled={loading || !!phoneError}
            className={`bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium px-6 py-2.5 rounded-lg text-sm shadow-sm transition cursor-pointer ${
              loading || phoneError ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateHotelModal
