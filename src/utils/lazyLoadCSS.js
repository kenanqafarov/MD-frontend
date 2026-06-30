import { useEffect } from 'react';

/**
 * CSS lazy loading utility
 * CSS fayllarını yalnız lazım olduqda yükləyir
 */
const loadedCSS = new Set();

/**
 * CSS faylını lazy load edir
 * @param {string} cssPath - CSS faylının yolu
 * @returns {Promise} - Yüklənmə promise-i
 */
export function lazyLoadCSS(cssPath) {
  if (loadedCSS.has(cssPath)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.onload = () => {
      loadedCSS.add(cssPath);
      resolve();
    };
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Komponentdə istifadə üçün hook
 * @param {string} cssPath - CSS faylının yolu
 */
export function useLazyCSS(cssPath) {
  useEffect(() => {
    if (cssPath) {
      lazyLoadCSS(cssPath);
    }
  }, [cssPath]);
}

