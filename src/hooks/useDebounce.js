import { useState, useEffect } from 'react';

/**
 * Debounce hook - API call optimizasiyası üçün
 * @param {any} value - Debounce ediləcək dəyər
 * @param {number} delay - Gözləmə müddəti (ms)
 * @returns {any} - Debounce edilmiş dəyər
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

