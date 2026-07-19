import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import { API_BASE_URL } from '../config'

function HotelList() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Formateur de prix pour correspondre au style Figma (ex: 25.000)
  const formatPrice = (priceVal) => {
    if (typeof priceVal === 'string' && priceVal.includes('.')) {
      // Si c'est un décimal Django (ex: "2000.00"), on le convertit proprement
      const num = parseFloat(priceVal)
      if (!isNaN(num)) {
        return Math.round(num).toLocaleString('fr-FR').replace(/\s/g, '.')
      }
      return priceVal
    }
    const num = parseFloat(priceVal)
    return isNaN(num) ? priceVal : num.toLocaleString('fr-FR').replace(/\s/g, '.')
  }

  useEffect(() => {
    const fetchHotels = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) return

      try {
        const response = await axios.get(`${API_BASE_URL}/hotels/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setHotels(response.data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des hôtels réels :', err)
        setHotels([])
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  // Gérer la suppression d'un hôtel
  const handleDelete = async (hotelId, hotelName) => {
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer l'hôtel "${hotelName}" ?`)
    if (!confirmDelete) return

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) return

    try {
      await axios.delete(`${API_BASE_URL}/hotels/${hotelId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      alert(`L'hôtel "${hotelName}" a été supprimé avec succès.`)
      // Mettre à jour l'état local pour faire disparaître la carte
      setHotels(hotels.filter((h) => h.id !== hotelId))
    } catch (err) {
      console.error("Erreur lors de la suppression :", err)
      alert("Impossible de supprimer l'hôtel. Veuillez réessayer.")
    }
  }

  // Filtrage dynamique des hôtels par nom ou adresse
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
      
      {/* Subheader : Title & Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl text-gray-800 flex items-center gap-2">
            Hôtels <span className="text-gray-400 text-lg font-light">{filteredHotels.length}</span>
          </h2>
        </div>
        
        {/* Button to Create Hotel */}
        <Link 
          to="/hotels/create" 
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Créer un nouveau hôtel
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500 animate-pulse text-sm">Chargement des hôtels...</span>
        </div>
      ) : filteredHotels.length === 0 ? (
        /* Empty State */
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
          <Link 
            to="/hotels/create" 
            className="bg-[#3d4449] hover:bg-[#2d3236] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition duration-150 shadow-sm"
          >
            Créer un nouveau hôtel
          </Link>
        </div>
      ) : (
        /* Grid of Hotels */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredHotels.map((hotel) => (
            <div 
              key={hotel.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-200 group relative"
            >
              {/* Photo Section */}
              <div className="h-44 w-full bg-gray-200 overflow-hidden relative">
                <img 
                  src={hotel.image} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80'
                  }}
                />
                
                {/* Boutons d'action flottants (visibles au survol) */}
                {!hotel.id.toString().startsWith('mock-') && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    {/* Bouton Modifier (Stylo) */}
                    <Link 
                      to={`/hotels/edit/${hotel.id}`}
                      className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Modifier l'hôtel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>

                    {/* Bouton Supprimer (Poubelle rouge) */}
                    <button 
                      onClick={() => handleDelete(hotel.id, hotel.name)}
                      className="bg-red-50/90 hover:bg-red-500 text-red-600 hover:text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Supprimer l'hôtel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Description Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Address (Earth-tone Red/Brown from Figma) */}
                  <p className="text-[10px] text-[#b85f36] font-medium truncate mb-1">
                    {hotel.address}
                  </p>
                  {/* Hotel Name */}
                  <h3 className="text-[#333333] font-bold text-md leading-tight mb-2 truncate">
                    {hotel.name}
                  </h3>
                </div>

                {/* Price & Currency */}
                <div className="text-xs text-gray-700 font-medium">
                  {formatPrice(hotel.price_per_night)} {hotel.currency === 'USD' ? 'Dollar' : hotel.currency === 'EUR' ? 'Euro' : hotel.currency} <span className="text-gray-400 font-normal">par nuit</span>
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
