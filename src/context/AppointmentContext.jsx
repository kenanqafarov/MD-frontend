import React, { createContext, useContext } from 'react';

// Məlumatlar
const roomOptions = [
  { value: 'STOM1', label: 'Otaq 1' },
  { value: 'STOM2', label: 'Otaq 2' },
  { value: 'STOM3', label: 'Otaq 3' },
  { value: 'STOM4', label: 'Otaq 4' },
  { value: 'STOM5', label: 'Otaq 5' },
];

const employees = []; // TODO: Bu məlumatı API-dən və ya store-dan gətirmək lazımdır

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  return (
    <AppointmentContext.Provider value={{ roomOptions, employees }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
}; 