import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar'
import Configurazione from './pages/Configurazione'
import ArgomentiRiferimenti from './pages/ArgomentiRiferimenti'
import PianoLavoro from './pages/PianoLavoro'
import { StepProvider } from './context/StepContext';
import Riepilogo from './pages/Riepilogo'

function App({ sesskey, wwwroot }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Stato per controllare il primo caricamento

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false); // Imposta che il primo caricamento è stato gestito
      if (window.location.pathname !== '/configurazione') {
        navigate('/configurazione'); // Reindirizza solo al primo caricamento
      }
    }
  }, [isFirstLoad, navigate]);



  return (
    <div className="scroll-container2 min-h-screen px-4">


      <StepProvider>
        <Navbar> </Navbar>
        <Routes>
          <Route path="/configurazione" element={<Configurazione sesskey={sesskey} wwwroot={wwwroot} />} />
          <Route path="/argomentiRiferimenti" element={<ArgomentiRiferimenti sesskey={sesskey} wwwroot={wwwroot} />} />
          <Route path="/pianoLavoro" element={<PianoLavoro sesskey={sesskey} wwwroot={wwwroot} />} />
          <Route path="/riepilogo" element={<Riepilogo />} />
          <Route path="*" element={<Configurazione sesskey={sesskey} wwwroot={wwwroot} />} />
        </Routes>
      </StepProvider>

    </div >
  )
}

export default App


