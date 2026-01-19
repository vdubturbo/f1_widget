import { useState, useEffect } from 'react';

export function useRotation(totalViews: number, intervalMs: number = 10000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (totalViews <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalViews);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, totalViews]);

  // Reset index if totalViews changes and current index is out of bounds
  useEffect(() => {
    if (currentIndex >= totalViews && totalViews > 0) {
      setCurrentIndex(0);
    }
  }, [totalViews, currentIndex]);

  return {
    currentIndex,
    totalViews,
  };
}
