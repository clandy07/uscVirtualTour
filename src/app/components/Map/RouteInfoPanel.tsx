'use client';

interface RouteInfoPanelProps {
  route: google.maps.DirectionsResult | null;
  destinationName: string;
  onClose: () => void;
}

export default function RouteInfoPanel({ route, destinationName, onClose }: RouteInfoPanelProps) {
  if (!route) return null;

  const leg = route.routes[0]?.legs[0];
  if (!leg) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-2xl w-80 z-10 overflow-hidden border border-gray-200">
      {/* Header with green theme for directions */}
      <div className="bg-green-700 text-white px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Directions to</h3>
            <p className="text-sm opacity-90 mt-1">{destinationName}</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white text-green-700 rounded-lg hover:bg-gray-100 text-sm font-bold transition-all"
            aria-label="End route"
          >
            End Route
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🚶</span>
              <p className="text-xs text-gray-500 font-bold">Walking</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{leg.duration?.text}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📏</span>
              <p className="text-xs text-gray-500 font-bold">Distance</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{leg.distance?.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
