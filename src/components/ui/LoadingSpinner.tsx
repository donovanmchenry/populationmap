import { FlickeringGrid } from './flickering-grid';

export function LoadingSpinner() {
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
      <div className="relative z-10 animate-in fade-in duration-700">
        {/* Modern spinner with multiple rings */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className="h-24 w-24 rounded-full border-4 border-transparent border-t-zinc-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-zinc-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 bg-zinc-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
