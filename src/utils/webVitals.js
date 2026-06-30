import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Web Vitals tracking
 * Performans metriklerini toplar ve analiz servisine gönderir
 */
function sendToAnalytics(metric) {
  // Development mode'da console'a yazdır
  if (import.meta.env.DEV) {
    console.log('Web Vital:', metric);
  }

  // Production'da analytics servisine gönder
  // Örnek: Google Analytics
  // if (window.gtag) {
  //   window.gtag('event', metric.name, {
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     event_label: metric.id,
  //     non_interaction: true,
  //   });
  // }

  // Örnek: Custom analytics endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // }).catch(console.error);
}

// Web Vitals'ı başlat
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // FID yerine INP kullanılıyor (web-vitals v5)
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

