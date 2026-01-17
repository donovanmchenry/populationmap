'use client';

import { useState, useEffect, useRef } from 'react';
import { CountryPopulationData } from '@/types/population';
import { calculateCurrentPopulation } from '@/lib/population-calc';

/**
 * Hook to maintain real-time population counters
 * Updates every second based on birth/death rates
 */
export function usePopulationCounter(initialData: CountryPopulationData[]) {
  const [currentData, setCurrentData] = useState(initialData);
  const startTimeRef = useRef(Date.now());
  const baseDataRef = useRef(initialData);

  // Update base data when initial data changes
  useEffect(() => {
    baseDataRef.current = initialData;
    startTimeRef.current = Date.now();
    setCurrentData(initialData);
  }, [initialData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      setCurrentData(
        baseDataRef.current.map(country => ({
          ...country,
          population: calculateCurrentPopulation(
            country.population,
            country.birthsPerSecond,
            country.deathsPerSecond,
            secondsElapsed
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentData;
}
