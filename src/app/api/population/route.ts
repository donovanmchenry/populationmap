import { NextResponse } from 'next/server';
import { fetchPopulationData } from '@/lib/worldbank';
import { calculateBirthsPerSecond, calculateDeathsPerSecond } from '@/lib/population-calc';
import { CountryPopulationData } from '@/types/population';

// Cache the response for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const rawData = await fetchPopulationData();

    // Process the raw data and calculate rates
    const processedData: CountryPopulationData[] = rawData.map(country => ({
      countryCode: country.countryCode,
      countryName: country.countryName,
      population: country.population,
      birthRate: country.birthRate,
      deathRate: country.deathRate,
      growthRate: country.growthRate,
      birthsPerSecond: calculateBirthsPerSecond(country.population, country.birthRate),
      deathsPerSecond: calculateDeathsPerSecond(country.population, country.deathRate),
      lastUpdated: new Date().toISOString(),
    }));

    // Filter out countries with no population data
    const validData = processedData.filter(country => country.population > 0);

    return NextResponse.json({
      success: true,
      data: validData,
      timestamp: new Date().toISOString(),
      count: validData.length,
    });
  } catch (error) {
    console.error('Error fetching population data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch population data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
