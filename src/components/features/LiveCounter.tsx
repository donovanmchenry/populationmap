'use client';

import { formatPopulation } from '@/lib/population-calc';

interface Props {
  totalPopulation: number;
}

export function LiveCounter({ totalPopulation }: Props) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        World Population
      </h2>
      <div className="text-6xl font-bold text-blue-600 tabular-nums">
        {formatPopulation(totalPopulation)}
      </div>
      <p className="text-sm text-gray-500 mt-2">Updating in real-time</p>
    </div>
  );
}
