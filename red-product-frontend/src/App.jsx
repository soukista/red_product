import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import HotelList from './pages/HotelList'
import CreateHotel from './pages/CreateHotel'
import EditHotel from './pages/EditHotel'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirection automatique de la racine vers la page de Connexion */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Pages d'Authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Pages d'Administration (Dashboard & Hôtels) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotels/create" element={<CreateHotel />} />
        <Route path="/hotels/edit/:id" element={<EditHotel />} />
      </Routes>
    </Router>
  )
}

export default App
