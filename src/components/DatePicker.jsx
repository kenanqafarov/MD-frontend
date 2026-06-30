// src/components/DatePicker.jsx

import React from 'react';

const DatePicker = ({ onChange, ...props }) => {
  const minDate = '1900-01-01';
  const maxDate = '3000-12-31';

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    const minLimit = new Date(minDate);
    const maxLimit = new Date(maxDate);

    // Seçilmiş tarixin limitlər arasında olub-olmadığını yoxlayırıq
    if (selectedDate < minLimit || selectedDate > maxLimit) {
      alert(`Zəhmət olmasa, tarixi ${minDate} və ${maxDate} aralığında seçin.`);
      // Limiti aşanda input sahəsinin dəyərini təmizləyə bilərik
      event.target.value = ''; 
    }

    // Əgər dəyişdirmək üçün xarici bir funksiya varsa, onu da çağırırıq
    if (onChange) {
      onChange(event);
    }
  };

  return <input type="date" min={minDate} max={maxDate} onChange={handleDateChange} {...props} />;
};

export default DatePicker;