'use client';

import { useEffect, useState } from 'react';
import { PopulationCartogram } from '@/components/features/PopulationCartogram';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePopulationCounter } from '@/hooks/usePopulationCounter';
import { CountryPopulationData } from '@/types/population';
import { formatPopulation } from '@/lib/population-calc';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

export default function Home() {
  const [initialData, setInitialData] = useState<CountryPopulationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const liveData = usePopulationCounter(initialData);
  const totalPopulation = liveData.reduce((sum, country) => sum + country.population, 0);

  useEffect(() => {
    fetch('/api/population')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setInitialData(result.data);
          setLoading(false);
        } else {
          setError(result.error);
          setLoading(false);
        }
      })
      .catch(err => {
        setError('Failed to load population data');
        setLoading(false);
        console.error('Error loading data:', err);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen">
        <FlickeringGrid
          className="absolute inset-0"
          squareSize={8}
          gridGap={12}
          flickerChance={0.3}
          color="rgb(63, 63, 70)"
          maxOpacity={0.15}
        />
        <div className="relative z-10 text-center text-red-400 p-8">
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* Fixed overlay UI */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="p-6">
          <div className="inline-flex flex-col gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 shadow-2xl">
            <div className="flex items-baseline gap-3">
              <h1 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                World Population
              </h1>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-zinc-500">Live</span>
              </div>
            </div>
            <div className="text-5xl font-bold text-zinc-100 tabular-nums tracking-tight">
              {formatPopulation(totalPopulation)}
            </div>
            <div className="text-xs text-zinc-500">
              {liveData.length} countries tracked
            </div>
          </div>
        </div>
      </div>

      {/* Project description */}
      <div className="absolute bottom-6 left-6 z-10 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 max-w-sm pointer-events-none">
        <h3 className="text-sm font-semibold text-zinc-100 mb-2">Live Population Map</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Real-time visualization of world population. Each bubble represents a country, sized by population and positioned at its geographic location. Population counters update every second based on live birth and death rates from World Bank data.
        </p>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-6 right-6 z-10 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-400 px-3 py-2 rounded-lg text-xs pointer-events-none">
        Drag to pan • Scroll to zoom
      </div>

      {/* Fullscreen map */}
      <PopulationCartogram data={liveData} />
    </main>
  );
}
