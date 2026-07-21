import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import bgImage from '../assets/background.jpg'

function DashboardLayout({ children, pageTitle, searchQuery, setSearchQuery }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Protection de route : redirection vers Login si pas de token (local ou session)
  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // Chargement dynamique du nom de l'utilisateur connecté
  const [userName, setUserName] = useState(
    localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || 'sakina kane'
  )
  const userInitial = userName.charAt(0).toUpperCase()

  // Chargement de l'email
  const userEmail = localStorage.getItem('user_email') || sessionStorage.getItem('user_email') || 'sakina@redproduct.com'

  // Gestion des notifications dynamiques
  const [notifications, setNotifications] = useState([
    { id: 1, text: `Bienvenue ${userName} sur votre tableau de bord RED Product.`, time: "À l'instant", read: false },
    { id: 2, text: "La base de données PostgreSQL est connectée et active.", time: "Il y a 5 min", read: false },
    { id: 3, text: "Le jeton d'accès a été configuré pour une durée de 24h.", time: "Il y a 10 min", read: false }
  ])
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  // Gestion du Modal de Profil
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [tempName, setTempName] = useState(userName)

  // Gestion du tiroir de menu mobile (responsive)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mettre à jour le profil localement
  const handleUpdateProfile = (e) => {
    e.preventDefault()
    if (!tempName.trim()) return

    if (localStorage.getItem('user_name')) {
      localStorage.setItem('user_name', tempName)
    }
    if (sessionStorage.getItem('user_name')) {
      sessionStorage.setItem('user_name', tempName)
    }
    setUserName(tempName)
    setShowProfileModal(false)
    
    // Pousser une notification de mise à jour du profil
    setNotifications(prev => [
      { id: Date.now(), text: "Votre profil administrateur a été mis à jour.", time: "À l'instant", read: false },
      ...prev
    ])
  }

  // Marquer toutes les notifications comme lues
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Liste des liens de la sidebar avec les icônes exactes de la maquette Figma
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      )
    },
    {
      name: 'Liste des hôtels',
      path: '/hotels',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 16v4" />
        </svg>
      )
    }
  ]

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans relative">

      {/* 0. MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Arrière-plan flouté */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu coulissant */}
          <aside className="relative w-64 bg-[#3d4449] text-white flex flex-col justify-between h-full z-10 transition-transform duration-200 overflow-hidden">
            {/* Motif de fond Figma dans la Sidebar */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center mix-blend-multiply opacity-[0.4] pointer-events-none"
              style={{ backgroundImage: `url(${bgImage})` }}
            />

            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              <div>
                {/* Logo & Close Button */}
                <div className="p-6 flex items-center justify-between border-b border-gray-600/30">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                      <path d="M4 4h16v16l-8-8l-8 8z" />
                    </svg>
                    <span className="font-bold tracking-wider text-md uppercase">Red Product</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Liens du Menu */}
                <div className="p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4 px-2">Principal</p>
                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = location.pathname === item.path
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition duration-150 ${
                            isActive 
                              ? 'bg-white text-gray-800' 
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>

              {/* Bloc Utilisateur mobile */}
              <div 
                onClick={() => {
                  setTempName(userName)
                  setShowProfileModal(true)
                  setIsMobileMenuOpen(false)
                }}
                className="p-4 border-t border-gray-600/30 flex items-center justify-between hover:bg-white/5 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden border-2 border-white flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userInitial}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm truncate w-32">{userName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full block border border-[#3d4449]"></span>
                      <span className="text-xs text-gray-300">en ligne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      
      {/* 1. SIDEBAR (RESPONSIVE) */}
      <aside className="relative w-64 bg-[#3d4449] text-white flex flex-col justify-between flex-shrink-0 hidden md:flex overflow-hidden">
        {/* Motif de fond Figma dans la Sidebar */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center mix-blend-multiply opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Contenu au premier plan */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          <div>
            {/* Logo & Application Name */}
            <div className="p-6 flex items-center gap-2 border-b border-gray-600/30">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-white"
                role="img"
              >
                <path d="M4 4h16v16l-8-8l-8 8z" />
              </svg>
              <span className="font-bold tracking-wider text-md uppercase">Red Product</span>
            </div>

            {/* Navigation Links */}
            <div className="p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4 px-2">Principal</p>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition duration-150 ${
                        isActive 
                          ? 'bg-white text-gray-800' 
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* User Connected Block (Bottom Sidebar) */}
          <div 
            onClick={() => {
              setTempName(userName)
              setShowProfileModal(true)
            }}
            className="p-4 border-t border-gray-600/30 flex items-center justify-between hover:bg-white/5 cursor-pointer transition duration-150"
            title="Gérer mon profil"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden border-2 border-white flex items-center justify-center select-none">
                <span className="text-white font-bold text-sm">{userInitial}</span>
              </div>
              {/* Infos Utilisateur */}
              <div>
                <p className="font-semibold text-sm truncate w-32">{userName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full block border border-[#3d4449]"></span>
                  <span className="text-xs text-gray-300">en ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER / TOPBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 relative">
          {/* Left Side (Burger & Page Title) */}
          <div className="flex items-center gap-3">
            {/* Burger Menu Button (Mobile only) */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none md:hidden"
              title="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Page Title */}
            <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Recherche"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-1.5 rounded-full border border-gray-200 focus:border-gray-400 outline-none text-sm text-gray-700 transition"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-1.5 text-gray-600 hover:text-gray-800 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#FFD964] text-gray-800 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu des Notifications */}
              {showNotifMenu && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50 text-left">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                    <h4 className="font-bold text-gray-800 text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#b85f36] hover:underline font-semibold"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-xs text-center py-6">Aucune notification.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                      className={`px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-50/50 last:border-0 cursor-pointer ${
                            !n.read ? 'bg-amber-50/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs text-gray-700 leading-snug ${!n.read ? 'font-medium' : ''}`}>
                              {n.text}
                            </p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profil Image (Header Avatar) */}
            <div 
              onClick={() => {
                setTempName(userName)
                setShowProfileModal(true)
              }}
              className="w-8 h-8 rounded-full bg-[#3d4449] overflow-hidden flex items-center justify-center text-white font-bold text-xs border border-gray-200 cursor-pointer hover:opacity-90 transition select-none"
              title="Mon Profil"
            >
              {userInitial}
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition cursor-pointer"
              title="Se déconnecter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* 3. MODAL PROFIL DYNAMIQUE (GLASSMORPHISM) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-lg text-gray-800">Mon Profil Admin</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Profile Avatar inside dialog */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#3d4449] text-white font-bold text-2xl flex items-center justify-center border-2 border-white shadow-md select-none">
                  {userInitial}
                </div>
                <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Admin En Ligne
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Adresse E-mail</label>
                <input 
                  type="text" 
                  disabled
                  value={userEmail}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 outline-none cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nom d'Administrateur</label>
                <input 
                  type="text" 
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full border border-gray-200 focus:border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="bg-[#3d4449] hover:bg-[#2d3236] text-white font-medium px-5 py-2 rounded-lg text-sm transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default DashboardLayout
