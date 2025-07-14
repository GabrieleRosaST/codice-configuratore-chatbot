import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar'
import Configurazione from './pages/Configurazione'
import ArgomentiRiferimenti from './pages/ArgomentiRiferimenti'
import PianoLavoro from './pages/PianoLavoro'
import { StepProvider } from './context/StepContext';
import Riepilogo from './pages/Riepilogo'

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




  return (
    <div className="scroll-container2 min-h-screen px-4">


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


