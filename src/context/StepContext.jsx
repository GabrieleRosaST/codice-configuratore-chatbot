import React, { createContext, useState, useContext } from 'react';

// Crea il contesto
const StepContext = createContext();

// Provider per il contesto
export const StepProvider = ({ children }) => {
    const [completedSteps, setCompletedSteps] = useState({
        step1: false,
        step2: false,
    });

    const [primaVisitaStep2, setPrimaVisitaStep2] = useState(true); // Stato per tracciare la prima visita allo step 2
    const [primaVisitaStep1, setPrimaVisitaStep1] = useState(true); // Stato per tracciare la prima visita allo step 1
    const [isEditMode, setIsEditMode] = useState(false); // Stato per tracciare se siamo in modalità edit
    const [showCheckArgomenti, setShowCheckArgomenti] = useState(false);
    const [showCheckConfigurazione, setShowCheckConfigurazione] = useState(false);

    return (
        <StepContext.Provider value={{
            completedSteps,
            setCompletedSteps,
            showCheckArgomenti,
            setShowCheckArgomenti,
            showCheckConfigurazione,
            setShowCheckConfigurazione,
            primaVisitaStep2,
            setPrimaVisitaStep2,
            primaVisitaStep1,
            setPrimaVisitaStep1,
            isEditMode,
            setIsEditMode,
        }}>
            {children}
        </StepContext.Provider>
    );
};

// Hook per utilizzare il contesto
export const useStepContext = () => useContext(StepContext);