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
    <div className="flex flex-col w-full min-h-screen mb-12 overflow-x-hidden ">

      <div className="h-20">
        <img src={header} />
      </div>


      <div className="flex-grow">
        <StepProvider>
          <Navbar>
          </Navbar>
          <Routes>
            <Route path="/configurazione" element={<Configurazione />} />
            <Route path="/argomentiRiferimenti" element={<ArgomentiRiferimenti />} />
            <Route path="/pianoLavoro" element={<PianoLavoro />} />
            <Route path="/riepilogo" element={<Riepilogo />} />
            <Route path="/corso-creato/:courseId" element={<CorsoCreato />} />
            <Route path="*" element={<Configurazione />} />
          </Routes>
        </StepProvider>

      </div>
    </div >
  )
}

export default App