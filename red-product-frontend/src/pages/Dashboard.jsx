import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import { API_BASE_URL } from '../config'

function Dashboard() {
  const navigate = useNavigate()
  const [statsData, setStatsData] = useState({
    hotels_count: 0,
    users_count: 0,
    messages_count: 0,
    emails_count: 0,
    forms_count: 0,
    entities_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      if (!token) return

      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard-stats/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setStatsData(response.data)
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques :', err)
        setError('Impossible de charger les statistiques depuis le serveur.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Les 6 cartes de statistiques liées aux valeurs dynamiques de l'API (sans descriptions absurdes)
  const stats = [
    {
      value: statsData.forms_count.toString(),
      label: 'Formulaires',
      bgColor: 'bg-[#a370f7] text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      value: statsData.messages_count.toString(),
      label: 'Messages',
      bgColor: 'bg-[#00c9a7] text-white',
      icon: (
        <span className="font-bold text-xl select-none">P</span>
      )
    },
    {
      value: statsData.users_count.toString(),
      label: 'Utilisateurs',
      bgColor: 'bg-[#ffc107] text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      )
    },
    {
      value: statsData.emails_count.toString(),
      label: 'E-mails',
      bgColor: 'bg-[#ff3b30] text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      value: statsData.hotels_count.toString(),
      label: 'Hôtels',
      bgColor: 'bg-[#9c27b0] text-white',
      link: '/hotels',
      icon: (
        <span className="font-bold text-xl select-none">P</span>
      )
    },
    {
      value: statsData.entities_count.toString(),
      label: 'Entités',
      bgColor: 'bg-[#1e74fd] text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      )
    }
  ]

  return (
    <DashboardLayout pageTitle="Dashboard">
      
      {/* Welcome Banner — pleine largeur, collé directement sous le header, sans espace gris */}
      <div className="bg-white -mx-8 -mt-8 px-8 py-5 mb-8 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-gray-800">
            Bienvenue sur <span className="font-semibold">RED Product</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Système d'administration et de gestion hôtelière.
          </p>
        </div>
        
        {loading && (
          <span className="text-xs text-gray-400 animate-pulse">
            Mise à jour en cours...
          </span>
        )}
      </div>

      {/* Affichage des erreurs si l'API échoue */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs py-2.5 px-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white rounded-xl p-6 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition duration-200 ${stat.link ? 'cursor-pointer hover:border-gray-300' : ''}`}
          >
            {/* Circle Icon Container */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bgColor}`}>
              {stat.icon}
            </div>

            {/* Text details */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-800">
                  {loading && stat.value === '0' ? '...' : stat.value}
                </span>
                <span className="text-gray-500 font-medium text-sm">{stat.label}</span>
              </div>
              {stat.link && (
                <span className="text-[11px] text-gray-400">Cliquer pour voir →</span>
              )}
            </div>
          </div>
        ))}
      </div>

    </DashboardLayout>
  )
}

export default Dashboard
