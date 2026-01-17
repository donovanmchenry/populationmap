'use client';

import { useState, useEffect, useRef } from 'react';
import { CountryPopulationData } from '@/types/population';
import { formatPopulation, calculateCurrentPopulation } from '@/lib/population-calc';

interface Props {
  country: CountryPopulationData;
  position: { x: number; y: number };
}

export function CountryTooltip({ country, position }: Props) {
  const [currentPopulation, setCurrentPopulation] = useState(country.population);
  const startTimeRef = useRef(Date.now());
  const basePopulationRef = useRef(country.population);

  // Reset when country changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    basePopulationRef.current = country.population;
    setCurrentPopulation(country.population);
  }, [country.countryCode, country.population]);

  // Update population every 100ms for smooth updates
  useEffect(() => {
    const interval = setInterval(() => {
      const secondsElapsed = (Date.now() - startTimeRef.current) / 1000;
      const newPopulation = calculateCurrentPopulation(
        basePopulationRef.current,
        country.birthsPerSecond,
        country.deathsPerSecond,
        secondsElapsed
      );
      setCurrentPopulation(newPopulation);
    }, 100);

    return () => clearInterval(interval);
  }, [country.birthsPerSecond, country.deathsPerSecond]);

  const birthsPerDay = Math.floor(country.birthsPerSecond * 86400);
  const deathsPerDay = Math.floor(country.deathsPerSecond * 86400);
  const netChangePerSecond = country.birthsPerSecond - country.deathsPerSecond;
  const isGrowing = netChangePerSecond > 0;

  return (
    <div
      className="fixed z-50 bg-zinc-900 rounded-lg shadow-2xl p-4 border border-zinc-700 pointer-events-none"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 120}px`,
        maxWidth: '300px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-zinc-100">{country.countryName}</h3>
        <div className="flex items-center gap-1">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isGrowing ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-zinc-300">
          <span className="font-semibold">Population:</span>{' '}
          <span className="tabular-nums text-zinc-100 font-medium">{formatPopulation(currentPopulation)}</span>
        </p>
        <p className={`text-xs ${isGrowing ? 'text-green-400' : 'text-red-400'}`}>
          {isGrowing ? '+' : ''}{netChangePerSecond.toFixed(2)} per second
        </p>
        <p className="text-zinc-300">
          <span className="font-semibold">Growth Rate:</span>{' '}
          {country.growthRate.toFixed(2)}%
        </p>
        <p className="text-green-400">
          <span className="font-semibold">Births/Day:</span>{' '}
          {formatPopulation(birthsPerDay)}
        </p>
        <p className="text-red-400">
          <span className="font-semibold">Deaths/Day:</span>{' '}
          {formatPopulation(deathsPerDay)}
        </p>
      </div>
    </div>
  );
}
