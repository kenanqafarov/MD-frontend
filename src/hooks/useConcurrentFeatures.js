import { useTransition, useDeferredValue, useState, useCallback } from 'react';

/**
 * React 19 Concurrent Features Hook
 * useTransition ve useDeferredValue kullanımını kolaylaştırır
 */
export function useConcurrentSearch(initialValue = '') {
  const [search, setSearch] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const handleSearchChange = useCallback((value) => {
    setSearch(value); // Urgent update - input hemen güncellenir
    
    startTransition(() => {
      // Non-urgent update - filtering gecikmeli yapılır
      // Bu sayede input responsive kalır
    });
  }, []);

  return {
    search,
    deferredSearch,
    isPending,
    handleSearchChange,
  };
}

/**
 * useTransition wrapper for expensive operations
 */
export function useExpensiveOperation() {
  const [isPending, startTransition] = useTransition();

  const execute = useCallback((operation) => {
    startTransition(() => {
      operation();
    });
  }, []);

  return { isPending, execute };
}

