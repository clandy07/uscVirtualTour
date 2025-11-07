'use client';

export default function LocationButton() {
  const handleLocationClick = () => {
    // TODO: Implement geolocation
    console.log('Get current location');
  };

  return (
    <button
      onClick={handleLocationClick}
      className="absolute bottom-6 right-6 w-14 h-14 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center z-20 transition-colors"
      aria-label="Get current location"
    >
      <div className="w-8 h-8 border-4 border-green-700 rounded-full relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-700 rounded-full" />
      </div>
    </button>
  );
}