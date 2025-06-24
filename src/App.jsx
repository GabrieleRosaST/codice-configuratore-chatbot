import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar'
import Configurazione from './pages/Configurazione'
import ArgomentiRiferimenti from './pages/ArgomentiRiferimenti'
import PianoLavoro from './pages/PianoLavoro'
import header from './img/header.svg'
import { StepProvider } from './context/StepContext';
import Riepilogo from './pages/Riepilogo'
import CorsoCreato from './pages/CorsoCreato'
import CorsoChatbot from './pages/CorsoChatbot'

function App() {

  const navigate = useNavigate();
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Stato per controllare il primo caricamento

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false); // Imposta che il primo caricamento è stato gestito
      if (window.location.pathname !== '/configurazione') {
        navigate('/configurazione'); // Reindirizza solo al primo caricamento
      }
    }
  }, [isFirstLoad, navigate]);


  if (window.location.pathname === '/corsoChatbot') {
    return <CorsoChatbot />;
  }


  return (
    <div className="w-screen scroll-container2">


      <StepProvider>
        <Navbar> </Navbar>
        <Routes>
          <Route path="/configurazione" element={<Configurazione />} />
          <Route path="/argomentiRiferimenti" element={<ArgomentiRiferimenti />} />
          <Route path="/pianoLavoro" element={<PianoLavoro />} />
          <Route path="/riepilogo" element={<Riepilogo />} />
          <Route path="*" element={<Configurazione />} />
        </Routes>
      </StepProvider>

    </div >
  )
}

export default App


