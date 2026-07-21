import { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import CreateHotelModal from '../components/CreateHotelModal'
import { API_BASE_URL } from '../config'

// Validation numéro sénégalais
const validateSenegalPhone = (phone) => {
  if (!phone || !phone.trim()) return true
  const cleaned = phone.replace(/[\s\-().+]/g, '')
  const local = cleaned.startsWith('221') ? cleaned.slice(3) : cleaned
  return /^7[05678]\d{7}$/.test(local)
}

function HotelList() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const formatPrice = (priceVal) => {
    const num = parseFloat(priceVal)
    return isNaN(num) ? priceVal : Math.round(num).toLocaleString('fr-FR').replace(/\s/g, '.')
  }

  useEffect(() => {
    const fetchHotels = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) return
      try {
        const response = await axios.get(`${API_BASE_URL}/hotels/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setHotels(response.data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des hôtels :', err)
        setHotels([])
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  }, [])

  // Appelé par la modale après création réussie
  const handleHotelCreated = (newHotel) => {
    setHotels((prev) => [newHotel, ...prev])
    setShowCreateModal(false)
  }

  const handleDelete = async (hotelId, hotelName) => {
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer l'hôtel "${hotelName}" ?`)
    if (!confirmDelete) return

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) return

    try {
      await axios.delete(`${API_BASE_URL}/hotels/${hotelId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHotels(hotels.filter((h) => h.id !== hotelId))
    } catch (err) {
      console.error("Erreur lors de la suppression :", err)
      alert("Impossible de supprimer l'hôtel. Veuillez réessayer.")
    }
  }

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout
      pageTitle="Liste des hôtels"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >

      {/* Modale de création */}
      {showCreateModal && (
        <CreateHotelModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleHotelCreated}
        />
      )}

      {/* Subheader */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl text-gray-800 flex items-center gap-2">
            Hôtels <span className="text-gray-400 text-lg font-light">{filteredHotels.length}</span>
          </h2>
        </div>

        {/* Bouton Créer → ouvre la modale */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition duration-150 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Créer un nouveau hôtel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500 animate-pulse text-sm">Chargement des hôtels...</span>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-[#333333] font-bold text-lg mb-1">Aucun hôtel enregistré</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Votre catalogue d'hôtels est actuellement vide. Ajoutez votre premier hôtel dès maintenant !
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#3d4449] hover:bg-[#2d3236] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition duration-150 shadow-sm cursor-pointer"
          >
            Créer un nouveau hôtel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-200 group relative"
            >
              {/* Photo */}
              <div className="h-44 w-full bg-gray-200 overflow-hidden relative">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80'
                  }}
                />

                {/* Boutons d'action flottants */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {/* Modifier */}
                  <a
                    href={`/hotels/edit/${hotel.id}`}
                    className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Modifier l'hôtel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </a>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDelete(hotel.id, hotel.name)}
                    className="bg-red-50/90 hover:bg-red-500 text-red-600 hover:text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Supprimer l'hôtel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Infos */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-[#b85f36] font-medium truncate mb-1">{hotel.address}</p>
                  <h3 className="text-[#333333] font-bold text-md leading-tight mb-2 truncate">{hotel.name}</h3>
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  {formatPrice(hotel.price_per_night)} {hotel.currency === 'USD' ? 'Dollar' : hotel.currency === 'EUR' ? 'Euro' : hotel.currency}{' '}
                  <span className="text-gray-400 font-normal">par nuit</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  )
}

export default HotelList
