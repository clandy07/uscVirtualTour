'use client';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function MapControls({ onZoomIn, onZoomOut }: MapControlsProps) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <button 
        onClick={onZoomIn}
        className="w-12 h-12 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-colors cursor-pointer"
        aria-label="Zoom in"
      >
        +
      </button>
      <button 
        onClick={onZoomOut}
        className="w-12 h-12 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-bold transition-colors cursor-pointer"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}